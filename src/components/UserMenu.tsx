import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  real_name: string;
  badge: string;
  plan: string;
}

interface UserRole {
  role: string;
}

const UserMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchUserRole();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("real_name, badge, plan")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setUserRole(data.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/auth");
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold_star':
        return 'text-yellow-500';
      case 'diamond':
        return 'text-blue-500';
      case 'bronze':
      default:
        return 'text-orange-500';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'gold_star':
        return '⭐';
      case 'diamond':
        return '💎';
      case 'bronze':
      default:
        return '🥉';
    }
  };

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>
              {profile?.real_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.real_name}</p>
            <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
              <span className={getBadgeColor(profile?.badge || 'bronze')}>
                {getBadgeIcon(profile?.badge || 'bronze')}
              </span>
              {profile?.plan?.toUpperCase()} Plan
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;