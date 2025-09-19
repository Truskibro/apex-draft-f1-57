import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { RacingButton } from '@/components/ui/racing-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { ArrowLeft, Shield, Save, Mail, History } from 'lucide-react';
import { PredictionHistory } from '@/components/fantasy/PredictionHistory';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { profile, loading, saving, updateProfile } = useProfile();
  const [pendingUpdates, setPendingUpdates] = useState<Partial<UserProfile>>({});

  const handleFieldUpdate = useCallback((updates: Partial<UserProfile>) => {
    setPendingUpdates(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (Object.keys(pendingUpdates).length === 0) {
      toast({
        title: 'No Changes',
        description: 'No changes to save.',
        variant: 'default'
      });
      return;
    }

    const success = await updateProfile(pendingUpdates);
    if (success) {
      setPendingUpdates({});
    }
  }, [pendingUpdates, updateProfile, toast]);
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    }
  };
  if (!user) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to access settings
            </p>
            <Link to="/auth">
              <RacingButton>Sign In</RacingButton>
            </Link>
          </div>
        </div>
      </div>;
  }
  if (loading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-xl text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <ProfileForm profile={profile} onUpdate={handleFieldUpdate} />

          {/* Notification Settings */}
          <NotificationSettings profile={profile} onUpdate={handleFieldUpdate} />

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>
                Manage your account settings and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Account Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator />
              <div className="flex justify-end">
                <RacingButton variant="outline" onClick={handleSignOut}>
                  Sign Out
                </RacingButton>
              </div>
            </CardContent>
          </Card>

          {/* Prediction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Prediction History
              </CardTitle>
              <CardDescription>
                View your past predictions and see how well you've performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionHistory />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <RacingButton variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </RacingButton>
            <RacingButton 
              onClick={handleSaveProfile} 
              disabled={saving || Object.keys(pendingUpdates).length === 0} 
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </RacingButton>
          </div>
        </div>
      </main>
    </div>;
};
export default Settings;