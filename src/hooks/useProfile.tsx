import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  team_name: string | null;
  notification_preferences: {
    email_notifications: boolean;
    weekly_digest: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Create a new profile if none exists
        const newProfile = {
          id: user.id,
          display_name: user.email?.split('@')[0] || null,
          username: 'Racing Driver',
          bio: null,
          team_name: null,
          notification_preferences: {
            email_notifications: true,
            weekly_digest: true
          }
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) throw insertError;
        
        // Fetch the newly created profile
        await fetchProfile();
        return;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.'
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, profile, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    updateProfile,
    refetch: fetchProfile
  };
};