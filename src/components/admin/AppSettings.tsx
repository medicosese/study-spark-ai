import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings } from "lucide-react";

const AppSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Manage global application settings and quotas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Advanced settings configuration coming soon. This will include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Plan quota customization</li>
                <li>Maintenance mode toggle</li>
                <li>Global announcement messages</li>
                <li>AI model configuration</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;