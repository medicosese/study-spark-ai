import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  message: {
    id: string;
    user_id: string;
    content: string | null;
    message_type: 'text' | 'voice';
    voice_url: string | null;
    created_at: string;
  };
}

const MessageItem = ({ message }: MessageItemProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('community_messages')
      .delete()
      .eq('id', message.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message deleted",
      });
    }
    setIsDeleting(false);
  };

  const handleReport = async () => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from('message_reports')
      .insert({
        message_id: message.id,
        reported_by: currentUserId,
        reason: 'Reported by user',
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to report message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message reported to moderators",
      });
    }
  };

  const isOwnMessage = currentUserId === message.user_id;

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 max-w-lg ${isOwnMessage ? 'items-end' : ''}`}>
        <div className={`rounded-lg p-3 ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          {message.message_type === 'text' && (
            <p className="break-words">{message.content}</p>
          )}
          {message.message_type === 'voice' && (
            <div className="flex items-center gap-2">
              <audio controls src={message.voice_url || ''} className="max-w-full" />
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
          isOwnMessage ? 'justify-end' : ''
        }`}>
          <span>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          
          {isOwnMessage ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleReport}
            >
              <Flag className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;