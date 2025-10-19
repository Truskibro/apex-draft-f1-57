import React from 'react';
import { Link } from 'react-router-dom';
import { RacingButton } from '@/components/ui/racing-button';
import { Trophy, Zap, Users } from 'lucide-react';
import heroImage from '@/assets/f1-hero.jpg';
import JoinLeagueDialog from '@/components/fantasy/JoinLeagueDialog';
import { useAuth } from '@/hooks/useAuth';
import CountdownTimer from '@/components/ui/countdown-timer';
import { useRaceTimer } from '@/hooks/useRaceTimer';
const HeroSection = () => {
  const {
    user
  } = useAuth();
  const {
    timingInfo
  } = useRaceTimer();
  return <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="F1 Racing Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          <div className="mb-4 md:mb-6 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary">2025 Season Live</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            Predict The Grid
            <br />
            <span className="bg-racing-gradient bg-clip-text text-transparent">
              Finishing Order
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl">
            Predict race finishing positions and earn championship points for correct predictions. 
            Compete in leagues and climb to the top of the global leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
            {user ? <RacingButton variant="racing" size="lg" className="gap-2 w-full sm:w-auto" asChild>
                <Link to="/create-league">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Create League</span>
                </Link>
              </RacingButton> : <RacingButton variant="racing" size="lg" className="gap-2 w-full sm:w-auto" asChild>
                <Link to="/auth">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Create League</span>
                </Link>
              </RacingButton>}
            
            {user ? <JoinLeagueDialog>
                <RacingButton variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Join League</span>
                </RacingButton>
              </JoinLeagueDialog> : <RacingButton variant="outline" size="lg" className="gap-2 w-full sm:w-auto" asChild>
                <Link to="/auth">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Join League</span>
                </Link>
              </RacingButton>}
          </div>

          {/* Race Day Countdown */}
          {timingInfo.isRaceDay && timingInfo.nextRace && <div className="mb-8 md:mb-12">
              <CountdownTimer targetDate={timingInfo.nextRace.raceDate} targetTime={timingInfo.nextRace.raceTime} title={`${timingInfo.nextRace.name} ${timingInfo.nextRace.country_flag}`} description="Race starts in" className="max-w-md" />
              {timingInfo.isPredictionLocked && <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium text-center">
                    🔒 Predictions are now locked! Race starts in less than 1 hour.
                  </p>
                </div>}
            </div>}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-sm md:max-w-md">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">20</div>
              <div className="text-xs text-muted-foreground">Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">10</div>
              <div className="text-xs text-muted-foreground">Positions</div>
            </div>
            <div className="text-center">
              
              
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;