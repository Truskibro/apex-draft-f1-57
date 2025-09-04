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
      
      const { data, error } = await supabase
        .from('user_standings')
        .select(`
          *,
          profiles(team_name, display_name)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) {
        console.log('❌ Supabase error:', error);
        toast({
          title: 'Error fetching standings',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      console.log('📊 Raw supabase data:', data);

      // Add sample data if no real data exists
      let standingsData = data || [];
      
      if (standingsData.length === 0) {
        console.log('📝 Creating sample data...');
        standingsData = [
          {
            id: '1',
            user_id: 'sample1',
            total_points: 1247,
            weekly_points: 89,
            rank: 1,
            previous_rank: 3,
            profiles: { team_name: 'Speed Demons', display_name: 'Alex Hamilton' }
          },
          {
            id: '2',
            user_id: 'sample2',
            total_points: 1198,
            weekly_points: 76,
            rank: 2,
            previous_rank: 1,
            profiles: { team_name: 'Apex Hunters', display_name: 'Sarah McLaren' }
          },
          {
            id: '3',
            user_id: 'sample3',
            total_points: 1156,
            weekly_points: 82,
            rank: 3,
            previous_rank: 4,
            profiles: { team_name: 'Grid Legends', display_name: 'Mike Verstappen' }
          },
          {
            id: '4',
            user_id: 'sample4',
            total_points: 1089,
            weekly_points: 65,
            rank: 4,
            previous_rank: 4,
            profiles: { team_name: 'Pole Position', display_name: 'Emma Ferrari' }
          },
          {
            id: '5',
            user_id: user?.id || 'current',
            total_points: 1034,
            weekly_points: 71,
            rank: 5,
            previous_rank: 8,
            profiles: { team_name: 'Racing Rebels', display_name: 'You' }
          },
          {
            id: '6',
            user_id: 'sample6',
            total_points: 987,
            weekly_points: 58,
            rank: 6,
            previous_rank: 6,
            profiles: { team_name: 'Speed Demons', display_name: 'James Bond' }
          },
          {
            id: '7',
            user_id: 'sample7',
            total_points: 934,
            weekly_points: 63,
            rank: 7,
            previous_rank: 9,
            profiles: { team_name: 'Apex Hunters', display_name: 'Lara Croft' }
          },
          {
            id: '8',
            user_id: 'sample8',
            total_points: 876,
            weekly_points: 45,
            rank: 8,
            previous_rank: 7,
            profiles: { team_name: 'Grid Legends', display_name: 'Tony Stark' }
          }
        ] as any[];
      }

      console.log('📋 Processing standings data:', standingsData);

      // Mark current user
      const standingsWithUser = standingsData.map((standing: any) => ({
        ...standing,
        profile: standing.profiles,
        isCurrentUser: standing.user_id === user?.id
      }));

      console.log('✅ Final standings:', standingsWithUser);
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