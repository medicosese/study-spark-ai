-- Create enum for community types
CREATE TYPE community_type AS ENUM ('public', 'private');

-- Create enum for member roles
CREATE TYPE community_role AS ENUM ('member', 'mini_admin', 'admin');

-- Create enum for message types
CREATE TYPE message_type AS ENUM ('text', 'voice');

-- Create enum for report status
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- Communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type community_type NOT NULL DEFAULT 'public',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community members table
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role community_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Community messages table
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT,
  message_type message_type NOT NULL DEFAULT 'text',
  voice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community bans table
CREATE TABLE public.community_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(community_id, user_id)
);

-- Message reports table
CREATE TABLE public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Public communities are viewable by everyone"
  ON public.communities FOR SELECT
  USING (type = 'public' OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creators and admins can update"
  ON public.communities FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id AND user_id = auth.uid() AND role IN ('admin', 'mini_admin')
  ));

-- RLS Policies for community_members
CREATE POLICY "Members can view their communities"
  ON public.community_members FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join public communities"
  ON public.community_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND type = 'public'))
  );

CREATE POLICY "Admins can add members"
  ON public.community_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_members.community_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'mini_admin')
  ));

-- RLS Policies for messages
CREATE POLICY "Members can view messages"
  ON public.community_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_messages.community_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.community_bans
    WHERE community_id = community_messages.community_id
    AND user_id = auth.uid()
    AND (expires_at IS NULL OR expires_at > now())
  ));

CREATE POLICY "Non-banned members can send messages"
  ON public.community_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_messages.community_id AND user_id = auth.uid()
    ) AND NOT EXISTS (
      SELECT 1 FROM public.community_bans
      WHERE community_id = community_messages.community_id
      AND user_id = auth.uid()
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Admins can delete messages"
  ON public.community_messages FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_messages.community_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'mini_admin')
    )
  );

-- RLS Policies for bans
CREATE POLICY "Members can view bans in their communities"
  ON public.community_bans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = community_bans.community_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can ban users"
  ON public.community_bans FOR INSERT
  WITH CHECK (
    banned_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_bans.community_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'mini_admin')
    )
  );

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.message_reports FOR SELECT
  USING (reported_by = auth.uid());

CREATE POLICY "Members can report messages"
  ON public.message_reports FOR INSERT
  WITH CHECK (reported_by = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;