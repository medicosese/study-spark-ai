import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { useToast } from "@/hooks/use-toast";
import PendingVerifications from "@/components/admin/PendingVerifications";
import UserManagement from "@/components/admin/UserManagement";
import AdminActionsLog from "@/components/admin/AdminActionsLog";
import AppSettings from "@/components/admin/AppSettings";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUserRole(roleData.role);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {isSuperAdmin ? 'Super Admin' : 'Admin'} Panel
              </h1>
              <p className="text-muted-foreground">Manage users and application settings</p>
            </div>
          </div>
          <UserMenu />
        </div>

        <Tabs defaultValue="verifications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Admin Logs</TabsTrigger>
            <TabsTrigger value="settings" disabled={!isSuperAdmin}>
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="verifications" className="mt-6">
            <PendingVerifications />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement isSuperAdmin={isSuperAdmin} />
          </TabsContent>
          
          <TabsContent value="logs" className="mt-6">
            <AdminActionsLog />
          </TabsContent>
          
          {isSuperAdmin && (
            <TabsContent value="settings" className="mt-6">
              <AppSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;