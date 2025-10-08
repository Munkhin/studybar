import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Account = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">Manage your account preferences</p>
          </div>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Study Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming study sessions
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Progress Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of your learning progress
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button variant="outline">Update Password</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
