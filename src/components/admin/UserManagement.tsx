import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Ban, Search, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  user_id: string;
  email: string;
  real_name: string;
  plan: string;
  badge: string;
  verification_status: string;
  is_blocked: boolean;
  role?: string;
}

interface UserManagementProps {
  isSuperAdmin: boolean;
}

const UserManagement = ({ isSuperAdmin }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching users:", profilesError);
      setLoading(false);
      return;
    }

    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      (profilesData || []).map(async (profile) => {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.user_id)
          .single();

        return {
          ...profile,
          role: roleData?.role || "user",
        };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.real_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleBlockUser = async (userId: string, currentlyBlocked: boolean, userName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !currentlyBlocked })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
      return;
    }

    // Log admin action
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", user.id)
      .single();

    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      admin_email: profile?.email || "unknown",
      action_type: currentlyBlocked ? "user_unblocked" : "user_blocked",
      target_user_id: userId,
      details: { user_name: userName },
    });

    toast({
      title: "Success",
      description: `User ${currentlyBlocked ? "unblocked" : "blocked"} successfully`,
    });

    fetchUsers();
  };

  const handleChangeRole = async (userId: string, newRole: string, userName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as "admin" | "moderator" | "super_admin" | "user" })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      return;
    }

    // Log admin action
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", user.id)
      .single();

    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      admin_email: profile?.email || "unknown",
      action_type: "role_changed",
      target_user_id: userId,
      details: { user_name: userName, new_role: newRole },
    });

    toast({
      title: "Success",
      description: `User role updated to ${newRole}`,
    });

    fetchUsers();
  };

  const handleChangePlan = async (userId: string, newPlan: string, userName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const badgeMap: Record<string, string> = {
      free: "bronze",
      basic: "diamond",
      premium: "gold_star",
    };

    const { error } = await supabase
      .from("profiles")
      .update({ 
        plan: newPlan as "basic" | "free" | "premium",
        badge: (badgeMap[newPlan] || "bronze") as "bronze" | "diamond" | "gold_star"
      })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user plan",
        variant: "destructive",
      });
      return;
    }

    // Log admin action
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", user.id)
      .single();

    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      admin_email: profile?.email || "unknown",
      action_type: "plan_changed",
      target_user_id: userId,
      details: { user_name: userName, new_plan: newPlan },
    });

    toast({
      title: "Success",
      description: `User plan updated to ${newPlan}`,
    });

    fetchUsers();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.user_id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{user.real_name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={user.is_blocked ? "destructive" : "default"}>
                    {user.is_blocked ? "Blocked" : user.verification_status}
                  </Badge>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Plan</label>
                  <Select
                    value={user.plan}
                    onValueChange={(value) => handleChangePlan(user.user_id, value, user.real_name)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleChangeRole(user.user_id, value, user.real_name)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-end">
                  <Button
                    variant={user.is_blocked ? "default" : "destructive"}
                    onClick={() => handleBlockUser(user.user_id, user.is_blocked, user.real_name)}
                    className="w-full"
                  >
                    {user.is_blocked ? (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="mr-2 h-4 w-4" />
                        Block
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;