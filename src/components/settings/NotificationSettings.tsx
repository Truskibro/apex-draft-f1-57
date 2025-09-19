import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';
import { UserProfile } from '@/hooks/useProfile';

interface NotificationSettingsProps {
  profile: UserProfile | null;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ profile, onUpdate }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  useEffect(() => {
    if (profile?.notification_preferences) {
      const prefs = profile.notification_preferences;
      setEmailNotifications(prefs.email_notifications ?? true);
      setWeeklyDigest(prefs.weekly_digest ?? true);
    }
  }, [profile]);

  const handleNotificationChange = (type: 'email_notifications' | 'weekly_digest', value: boolean) => {
    const newPrefs = {
      email_notifications: type === 'email_notifications' ? value : emailNotifications,
      weekly_digest: type === 'weekly_digest' ? value : weeklyDigest
    };

    if (type === 'email_notifications') {
      setEmailNotifications(value);
    } else {
      setWeeklyDigest(value);
    }

    onUpdate({
      notification_preferences: newPrefs
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>
          Manage how you receive updates about your leagues and races
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications about league updates and race results
            </p>
          </div>
          <Switch 
            checked={emailNotifications} 
            onCheckedChange={(value) => handleNotificationChange('email_notifications', value)} 
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Weekly Digest</Label>
            <p className="text-sm text-muted-foreground">
              Get a weekly summary of your league standings and upcoming races
            </p>
          </div>
          <Switch 
            checked={weeklyDigest} 
            onCheckedChange={(value) => handleNotificationChange('weekly_digest', value)} 
          />
        </div>
      </CardContent>
    </Card>
  );
};