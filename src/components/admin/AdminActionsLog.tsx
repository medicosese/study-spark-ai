import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

interface AdminAction {
  id: string;
  admin_email: string;
  action_type: string;
  details: any;
  timestamp: string;
}

const AdminActionsLog = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-actions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_actions',
        },
        (payload) => {
          setActions((current) => [payload.new as AdminAction, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActions = async () => {
    const { data, error } = await supabase
      .from("admin_actions")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching admin actions:", error);
    } else {
      setActions(data || []);
    }
    setLoading(false);
  };

  const getActionBadgeVariant = (actionType: string) => {
    if (actionType.includes("approved")) return "default";
    if (actionType.includes("rejected") || actionType.includes("blocked")) return "destructive";
    if (actionType.includes("role")) return "secondary";
    return "outline";
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading admin actions...</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No admin actions recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <Card key={action.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{action.admin_email}</span>
                    <Badge variant={getActionBadgeVariant(action.action_type)}>
                      {formatActionType(action.action_type)}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                  </span>
                </div>
                {action.details && (
                  <p className="text-sm text-muted-foreground">
                    {JSON.stringify(action.details, null, 2)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminActionsLog;