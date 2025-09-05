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

      // Fallback to sample data if no real data exists
      console.log('📝 No real data found, using sample data...');
      const sampleStandingsData = [
        {
          id: '1',
          user_id: 'sample1',
          total_points: 1847,
          weekly_points: 125,
          rank: 1,
          previous_rank: 2,
          profiles: { team_name: 'McLaren Masters', display_name: 'Alex Hamilton' }
        },
        {
          id: '2',
          user_id: 'sample2',
          total_points: 1798,
          weekly_points: 98,
          rank: 2,
          previous_rank: 1,
          profiles: { team_name: 'Oracle Racers', display_name: 'Sarah McLaren' }
        },
        {
          id: '3',
          user_id: 'sample3',
          total_points: 1756,
          weekly_points: 112,
          rank: 3,
          previous_rank: 4,
          profiles: { team_name: 'Red Bull Rebels', display_name: 'Mike Verstappen' }
        },
        {
          id: '4',
          user_id: 'sample4',
          total_points: 1689,
          weekly_points: 87,
          rank: 4,
          previous_rank: 3,
          profiles: { team_name: 'Mercedes Mavens', display_name: 'Emma Russell' }
        },
        {
          id: '5',
          user_id: user?.id || 'current',
          total_points: 1634,
          weekly_points: 104,
          rank: 5,
          previous_rank: 6,
          profiles: { team_name: 'Ferrari Fanatics', display_name: 'You' }
        },
        {
          id: '6',
          user_id: 'sample6',
          total_points: 1587,
          weekly_points: 76,
          rank: 6,
          previous_rank: 5,
          profiles: { team_name: 'Williams Warriors', display_name: 'James Bond' }
        },
        {
          id: '7',
          user_id: 'sample7',
          total_points: 1534,
          weekly_points: 89,
          rank: 7,
          previous_rank: 8,
          profiles: { team_name: 'Aston Martin Aces', display_name: 'Lara Croft' }
        },
        {
          id: '8',
          user_id: 'sample8',
          total_points: 1476,
          weekly_points: 63,
          rank: 8,
          previous_rank: 7,
          profiles: { team_name: 'Alpine Alphas', display_name: 'Tony Stark' }
        }
      ] as any[];

      console.log('📋 Processing sample standings data:', sampleStandingsData);

      // Mark current user in sample data
      const standingsWithUser = sampleStandingsData.map((standing: any) => ({
        ...standing,
        profile: standing.profiles,
        isCurrentUser: standing.user_id === user?.id
      }));

      console.log('✅ Final sample standings:', standingsWithUser);
      setStandings(standingsWithUser);
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