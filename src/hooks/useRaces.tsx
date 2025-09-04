import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Race = {
  id: string;
  name: string;
  location: string;
  country_flag: string;
  race_date: string;
  race_time: string;
  status: 'upcoming' | 'live' | 'completed';
  current_lap?: string;
  total_laps?: number;
  winner?: string;
};

export const useRaces = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .order('race_date', { ascending: true });

      if (error) {
        toast({
          title: 'Error fetching races',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setRaces(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load races',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { races, loading, refetch: fetchRaces };
};