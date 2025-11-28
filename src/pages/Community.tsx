import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CommunityList from "@/components/community/CommunityList";
import CreateCommunityDialog from "@/components/community/CreateCommunityDialog";

const Community = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community</h1>
            <p className="text-muted-foreground">Connect and chat with other learners</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="joined">My Communities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-6">
            <CommunityList type="browse" />
          </TabsContent>
          
          <TabsContent value="joined" className="mt-6">
            <CommunityList type="joined" />
          </TabsContent>
        </Tabs>
      </div>

      <CreateCommunityDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Community;