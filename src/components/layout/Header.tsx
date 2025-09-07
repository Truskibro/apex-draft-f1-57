import React from 'react';
import { Link } from 'react-router-dom';
import { RacingButton } from '@/components/ui/racing-button';
import { Flag, Settings, LogOut, Trophy, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStandings } from '@/hooks/useStandings';
import JoinLeagueDialog from '@/components/fantasy/JoinLeagueDialog';

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { standings } = useStandings();
  
  const currentUserPoints = standings.find(s => s.isCurrentUser)?.total_points || 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Flag className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm md:text-lg font-bold text-primary">F1 Fantasy</span>
              <span className="text-xs text-muted-foreground -mt-1 hidden sm:inline">League</span>
            </div>
          </Link>
          
          {user && (
            <RacingButton variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/my-leagues" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>My Leagues</span>
              </Link>
            </RacingButton>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {user ? (
            <>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Signed in as:</span>
                <span className="text-sm font-medium truncate max-w-32">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                <Trophy className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground hidden md:inline">Season Points</span>
                  <span className="text-xs md:text-sm font-bold text-primary">{currentUserPoints}</span>
                </div>
              </div>
              
              <RacingButton variant="metallic" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </RacingButton>
              
              <RacingButton variant="outline" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Sign Out</span>
              </RacingButton>
              
              {/* Mobile Sign Out */}
              <RacingButton variant="outline" size="sm" onClick={handleSignOut} className="md:hidden">
                <LogOut className="h-4 w-4" />
              </RacingButton>
            </>
          ) : (
            <Link to="/auth">
              <RacingButton variant="racing" size="sm">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </RacingButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;