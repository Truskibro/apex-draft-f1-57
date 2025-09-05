import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { RacingButton } from '@/components/ui/racing-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trophy, Users, Lock, Globe } from 'lucide-react';

const CreateLeague = () => {
  const [leagueName, setLeagueName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [userRole, setUserRole] = useState('owner');

  const handleCreateLeague = () => {
    // TODO: Implement league creation logic
    console.log({
      leagueName,
      description,
      visibility,
      userRole
    });
  };

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New League</h1>
          <p className="text-xl text-muted-foreground">
            Set up your F1 fantasy league and invite friends to compete
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                League Details
              </CardTitle>
              <CardDescription>
                Give your league a name and description that will attract participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="league-name">League Name</Label>
                <Input
                  id="league-name"
                  placeholder="e.g., Weekend Warriors F1 League"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your league rules, goals, or what makes it special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Choose who can see and join your league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={visibility} onValueChange={setVisibility}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="public" id="public" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Globe className="h-4 w-4 text-green-500" />
                      Public League
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Anyone can find and join your league
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="private" id="private" />
                  <div className="flex-1">
                    <Label htmlFor="private" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Lock className="h-4 w-4 text-orange-500" />
                      Private League
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only people with an invite can join
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Role
              </CardTitle>
              <CardDescription>
                Choose your role in this league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={userRole} onValueChange={setUserRole}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="owner" id="owner" />
                  <div className="flex-1">
                    <Label htmlFor="owner" className="font-medium cursor-pointer">
                      Owner
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Full control over league settings, can add/remove admins and members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="admin" id="admin" />
                  <div className="flex-1">
                    <Label htmlFor="admin" className="font-medium cursor-pointer">
                      Admin
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Can manage league settings and moderate members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="member" id="member" />
                  <div className="flex-1">
                    <Label htmlFor="member" className="font-medium cursor-pointer">
                      Member
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Can participate in the league and make predictions
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <RacingButton 
              variant="racing" 
              size="lg" 
              onClick={handleCreateLeague}
              disabled={!leagueName.trim()}
              className="flex-1"
            >
              Create League
            </RacingButton>
            <RacingButton variant="outline" size="lg" asChild>
              <Link to="/">Cancel</Link>
            </RacingButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateLeague;