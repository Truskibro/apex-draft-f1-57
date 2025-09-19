import React, { useState, useEffect } from 'react';
import { Clock, Flag } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CountdownTimerProps {
  targetDate: string;
  targetTime: string;
  title?: string;
  description?: string;
  onComplete?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  targetTime,
  title = "Next Race",
  description = "Race starts in",
  onComplete,
  className = ""
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Combine date and time for full datetime
      const targetDateTime = new Date(`${targetDate}T${targetTime}`);
      const now = new Date();
      const difference = targetDateTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          onComplete?.();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime, isExpired, onComplete]);

  if (isExpired) {
    return (
      <Card className={`p-4 border-2 border-destructive/20 bg-destructive/5 ${className}`}>
        <div className="flex items-center gap-3 text-center justify-center">
          <Flag className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="text-lg font-bold text-destructive">Race Started!</h3>
            <p className="text-sm text-muted-foreground">The race has begun</p>
          </div>
        </div>
      </Card>
    );
  }

  // Only show countdown if it's race day (less than 24 hours)
  const totalHours = timeLeft.days * 24 + timeLeft.hours;
  if (totalHours >= 24) {
    return null;
  }

  return (
    <Card className={`p-4 border-2 border-accent/20 bg-accent/5 ${className}`}>
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-3">
          <Clock className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-accent">{title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-card rounded-lg p-2 border">
            <div className="text-xl font-bold text-accent">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
          <div className="bg-card rounded-lg p-2 border">
            <div className="text-xl font-bold text-accent">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </div>
          <div className="bg-card rounded-lg p-2 border">
            <div className="text-xl font-bold text-accent">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground">Minutes</div>
          </div>
          <div className="bg-card rounded-lg p-2 border">
            <div className="text-xl font-bold text-accent">{timeLeft.seconds}</div>
            <div className="text-xs text-muted-foreground">Seconds</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CountdownTimer;