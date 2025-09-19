import { useState, useEffect } from 'react';
import { useRaces } from '@/hooks/useRaces';

export interface RaceTimingInfo {
  nextRace: {
    id: string;
    name: string;
    location: string;
    raceDate: string;
    raceTime: string;
    country_flag: string;
  } | null;
  isRaceDay: boolean;
  isPredictionLocked: boolean;
  timeUntilRace: number; // milliseconds
  timeUntilLockout: number; // milliseconds (1 hour before race)
}

export const useRaceTimer = () => {
  const { races, loading } = useRaces();
  const [timingInfo, setTimingInfo] = useState<RaceTimingInfo>({
    nextRace: null,
    isRaceDay: false,
    isPredictionLocked: false,
    timeUntilRace: 0,
    timeUntilLockout: 0,
  });

  useEffect(() => {
    const updateTimingInfo = () => {
      const now = new Date();
      
      // Find the next upcoming race
      const upcomingRaces = races.filter(race => race.status === 'upcoming');
      const nextRace = upcomingRaces.length > 0 ? upcomingRaces[0] : null;

      if (!nextRace) {
        setTimingInfo({
          nextRace: null,
          isRaceDay: false,
          isPredictionLocked: false,
          timeUntilRace: 0,
          timeUntilLockout: 0,
        });
        return;
      }

      // Parse race date and time
      const raceDateTime = new Date(`${nextRace.race_date}T${nextRace.race_time}`);
      const timeUntilRace = raceDateTime.getTime() - now.getTime();
      
      // Lockout time is 1 hour (3600000 ms) before race start
      const lockoutTime = new Date(raceDateTime.getTime() - (60 * 60 * 1000)); // 1 hour before
      const timeUntilLockout = lockoutTime.getTime() - now.getTime();
      
      // Race day is when there's less than 24 hours until race
      const isRaceDay = timeUntilRace > 0 && timeUntilRace < (24 * 60 * 60 * 1000);
      
      // Predictions are locked 1 hour before race start
      const isPredictionLocked = timeUntilLockout <= 0;

      setTimingInfo({
        nextRace: {
          id: nextRace.id,
          name: nextRace.name,
          location: nextRace.location,
          raceDate: nextRace.race_date,
          raceTime: nextRace.race_time,
          country_flag: nextRace.country_flag,
        },
        isRaceDay,
        isPredictionLocked,
        timeUntilRace,
        timeUntilLockout,
      });
    };

    if (!loading && races.length > 0) {
      updateTimingInfo();
      
      // Update every minute
      const interval = setInterval(updateTimingInfo, 60000);
      return () => clearInterval(interval);
    }
  }, [races, loading]);

  return { timingInfo, loading };
};