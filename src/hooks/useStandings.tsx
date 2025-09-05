import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type Standing = {
  id: string;
  user_id: string;
  total_points: number;
  weekly_points: number;
  rank: number;
  previous_rank?: number;
  profile?: {
    team_name: string;
    display_name?: string;
  };
  isCurrentUser?: boolean;
};

export const useStandings = () => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStandings();
  }, [user]);

  const fetchStandings = async () => {
    try {
      console.log('🔍 Fetching standings...');
      
      // Try to get real data from user_standings with profiles
      const { data: standingsData, error } = await supabase
        .from('user_standings')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) {
        console.log('❌ Supabase error:', error);
      }

      console.log('📊 Raw supabase standings data:', standingsData);

      // If we have real data, use it
      if (standingsData && standingsData.length > 0) {
        // Fetch profiles for the users in standings
        const userIds = standingsData.map(s => s.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, team_name')
          .in('id', userIds);

        // Combine standings with profile data
        const standingsWithProfiles = standingsData.map((standing: any) => {
          const profile = profilesData?.find(p => p.id === standing.user_id);
          return {
            ...standing,
            profile: profile ? {
              team_name: profile.team_name || 'No Team',
              display_name: profile.display_name || 'Anonymous User'
            } : {
              team_name: 'No Team',
              display_name: 'Anonymous User'
            },
            isCurrentUser: standing.user_id === user?.id
          };
        });

        console.log('✅ Using real standings data:', standingsWithProfiles);
        setStandings(standingsWithProfiles);
        return;
      }

      // No real data available - set empty array instead of sample data
      console.log('📝 No real data found, showing empty state...');
      setStandings([]);
    } catch (error) {
      console.log('❌ Catch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load standings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { standings, loading, refetch: fetchStandings };
};