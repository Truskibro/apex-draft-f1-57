import React from 'react';
import { RacingButton } from '@/components/ui/racing-button';
import { Trophy, Zap, Users } from 'lucide-react';
import heroImage from '@/assets/f1-hero.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="F1 Racing Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">2025 Season Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Predict The
            <br />
            <span className="bg-racing-gradient bg-clip-text text-transparent">
              Finishing Order
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
            Predict race finishing positions and earn championship points for correct predictions. 
            Compete in leagues and climb to the top of the global leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <RacingButton variant="racing" size="xl" className="gap-2">
              <Trophy className="h-5 w-5" />
              Make Predictions
            </RacingButton>
            <RacingButton variant="outline" size="xl" className="gap-2">
              <Users className="h-5 w-5" />
              Join League
            </RacingButton>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">20</div>
              <div className="text-xs text-muted-foreground">Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10</div>
              <div className="text-xs text-muted-foreground">Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">25</div>
              <div className="text-xs text-muted-foreground">Max Points</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;