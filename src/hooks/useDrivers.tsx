import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Driver = {
  id: string;
  name: string;
  country: string;
  number: number;
  championship_points: number;
  team: {
    id: string;
    name: string;
    color: string;
  };
};

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          team:teams(*)
        `)
        .order('championship_points', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching drivers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setDrivers(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load drivers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { drivers, loading, refetch: fetchDrivers };
};