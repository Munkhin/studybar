import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Bell, Lock, Palette } from "lucide-react";

const Account = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Account Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile Section */}
        <Card className="p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                ST
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold mb-1">Student Name</h2>
              <p className="text-muted-foreground">student@example.com</p>
              <Button variant="outline" size="sm" className="mt-3">
                Change Avatar
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input id="email" type="email" placeholder="student@example.com" />
            </div>

            <Button className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Preferences
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" value="English" className="mt-2" disabled />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value="UTC-5 (Eastern Time)" className="mt-2" disabled />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Study Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when it's time to study
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Progress Updates</p>
                <p className="text-sm text-muted-foreground">
                  Weekly summaries of your learning progress
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error Log Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about repeated mistakes
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" className="mt-2" />
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" className="mt-2" />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" className="mt-2" />
            </div>

            <Button variant="outline">
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Account;
