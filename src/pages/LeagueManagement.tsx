import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { RacingButton } from '@/components/ui/racing-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Settings, 
  Globe, 
  Lock, 
  UserPlus, 
  Copy,
  Mail,
  Crown,
  User
} from 'lucide-react';

interface League {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'private';
  owner_id: string;
  created_at: string;
}

interface LeagueMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profiles: {
    display_name: string | null;
  } | null;
}

const LeagueManagement = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (leagueId) {
      fetchLeagueData();
    }
  }, [leagueId]);

  const fetchLeagueData = async () => {
    if (!leagueId) return;
    
    try {
      // Fetch league details
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;
      setLeague(leagueData as League);
      setEditedName(leagueData.name);
      setEditedDescription(leagueData.description || '');

      // Fetch league members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('league_members')
        .select('*')
        .eq('league_id', leagueId);

      if (membersError) throw membersError;

      // Fetch user profiles separately to avoid relation issues
      const userIds = membersData?.map(m => m.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      // Combine the data
      const membersWithProfiles = membersData?.map(member => ({
        ...member,
        profiles: profilesData?.find(p => p.id === member.user_id) || null
      })) || [];

      setMembers(membersWithProfiles as LeagueMember[]);
    } catch (error) {
      console.error('Error fetching league data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load league data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeague = async () => {
    if (!league || !user) return;

    try {
      const { error } = await supabase
        .from('leagues')
        .update({
          name: editedName,
          description: editedDescription,
        })
        .eq('id', league.id);

      if (error) throw error;

      setLeague({ ...league, name: editedName, description: editedDescription });
      setEditMode(false);
      toast({
        title: 'Success',
        description: 'League updated successfully',
      });
    } catch (error) {
      console.error('Error updating league:', error);
      toast({
        title: 'Error',
        description: 'Failed to update league',
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-league/${leagueId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Copied!',
      description: 'Invite link copied to clipboard',
    });
  };

  const sendInviteEmail = async () => {
    if (!inviteEmail.trim()) return;

    // This would need an edge function to send emails
    toast({
      title: 'Feature Coming Soon',
      description: 'Email invitations will be available soon!',
    });
    setInviteEmail('');
  };

  const isOwner = user && league && user.id === league.owner_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">League Not Found</h1>
            <Link to="/">
              <RacingButton>Back to Home</RacingButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid gap-6">
          {/* League Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-primary" />
                  <div>
                    {editMode ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-2xl font-bold h-auto p-1 mb-2"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold">{league.name}</h1>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant={league.visibility === 'public' ? 'default' : 'secondary'}>
                        {league.visibility === 'public' ? (
                          <><Globe className="h-3 w-3 mr-1" />Public</>
                        ) : (
                          <><Lock className="h-3 w-3 mr-1" />Private</>
                        )}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(league.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <RacingButton variant="outline" size="sm" onClick={() => setEditMode(false)}>
                          Cancel
                        </RacingButton>
                        <RacingButton size="sm" onClick={updateLeague}>
                          Save
                        </RacingButton>
                      </>
                    ) : (
                      <RacingButton variant="outline" size="sm" onClick={() => setEditMode(true)}>
                        <Settings className="h-4 w-4" />
                        Edit
                      </RacingButton>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="League description..."
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">
                  {league.description || 'No description provided'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Invite Members */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Invite Members
                </CardTitle>
                <CardDescription>
                  Invite others to join your league
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <RacingButton variant="outline" onClick={copyInviteLink} className="flex-1">
                    <Copy className="h-4 w-4" />
                    Copy Invite Link
                  </RacingButton>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Invite by Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <RacingButton onClick={sendInviteEmail} disabled={!inviteEmail.trim()}>
                      <Mail className="h-4 w-4" />
                      Send
                    </RacingButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* League Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        {member.role === 'owner' ? (
                          <Crown className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.profiles?.display_name || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LeagueManagement;