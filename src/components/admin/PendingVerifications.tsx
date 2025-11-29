import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PendingUser {
  user_id: string;
  email: string;
  real_name: string;
  father_name: string;
  whatsapp_number: string;
  batch_year: string;
  class_or_degree: string;
  medical_id_card_url: string | null;
  created_at: string;
}

const PendingVerifications = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching pending users:", error);
    } else {
      setPendingUsers(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string, userName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq("user_id", userId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to approve user",
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
      action_type: "user_approved",
      target_user_id: userId,
      details: { user_name: userName },
    });

    toast({
      title: "Success",
      description: `${userName} has been approved`,
    });

    fetchPendingUsers();
  };

  const handleReject = async (userId: string, userName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_status: "rejected",
      })
      .eq("user_id", userId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to reject user",
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
      action_type: "user_rejected",
      target_user_id: userId,
      details: { user_name: userName },
    });

    toast({
      title: "Success",
      description: `${userName} has been rejected`,
    });

    fetchPendingUsers();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading pending verifications...</p>
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No pending verifications
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => (
        <Card key={user.user_id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{user.real_name}</CardTitle>
                <CardDescription>
                  Father: {user.father_name} • {user.email}
                </CardDescription>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium">WhatsApp:</span> {user.whatsapp_number}
              </div>
              <div>
                <span className="font-medium">Batch:</span> {user.batch_year}
              </div>
              <div>
                <span className="font-medium">Class/Degree:</span> {user.class_or_degree}
              </div>
              <div>
                <span className="font-medium">Registered:</span>{" "}
                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </div>
            </div>

            {user.medical_id_card_url && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(user.medical_id_card_url!, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Medical ID Card
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove(user.user_id, user.real_name)}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(user.user_id, user.real_name)}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingVerifications;