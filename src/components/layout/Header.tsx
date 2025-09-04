import React from 'react';
import { RacingButton } from '@/components/ui/racing-button';
import { Flag, Trophy, Users, Calendar, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flag className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">F1 Fantasy</span>
              <span className="text-xs text-muted-foreground -mt-1">League</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <RacingButton variant="ghost" size="sm" className="gap-2">
              <Trophy className="h-4 w-4" />
              Dashboard
            </RacingButton>
            <RacingButton variant="ghost" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              My Team
            </RacingButton>
            <RacingButton variant="ghost" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </RacingButton>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-lg">
            <span className="text-xs font-medium text-accent">Budget:</span>
            <span className="text-sm font-bold text-accent">$87.5M</span>
          </div>
          
          <RacingButton variant="metallic" size="sm">
            <Settings className="h-4 w-4" />
          </RacingButton>
          
          <RacingButton variant="racing" size="sm">
            Join League
          </RacingButton>
        </div>
      </div>
    </header>
  );
};

export default Header;