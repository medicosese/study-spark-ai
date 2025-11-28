import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  description: string | null;
  type: 'public' | 'private';
  created_at: string;
}

interface CommunityListProps {
  type: 'browse' | 'joined';
}

const CommunityList = ({ type }: CommunityListProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunities();
  }, [type]);

  const fetchCommunities = async () => {
    setLoading(true);
    
    if (type === 'browse') {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('type', 'public')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching communities:', error);
      } else {
        setCommunities(data || []);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCommunities([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('community_members')
        .select('community_id, communities(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching joined communities:', error);
      } else {
        setCommunities(data?.map(item => item.communities).filter(Boolean) as Community[] || []);
      }
    }
    
    setLoading(false);
  };

  const handleJoinCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join communities",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member'
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already a member",
          description: "You're already part of this community",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join community",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success",
        description: "You've joined the community!",
      });
      fetchCommunities();
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {type === 'browse' 
              ? 'No communities available yet' 
              : "You haven't joined any communities yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => (
        <Card key={community.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                {community.type === 'private' && <Lock className="h-4 w-4" />}
                {community.name}
              </CardTitle>
              <Badge variant={community.type === 'public' ? 'default' : 'secondary'}>
                {community.type}
              </Badge>
            </div>
            {community.description && (
              <CardDescription className="line-clamp-2">
                {community.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {type === 'browse' ? (
                <Button 
                  className="w-full" 
                  onClick={() => handleJoinCommunity(community.id)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Join
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/community/${community.id}`)}
                >
                  Open Chat
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommunityList;