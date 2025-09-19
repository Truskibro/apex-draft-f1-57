import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/hooks/useProfile';

interface ProfileFormProps {
  profile: UserProfile | null;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onUpdate }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    const trimmedValue = value.trim();
    const update: Partial<UserProfile> = {};
    
    switch (field) {
      case 'display_name':
        setDisplayName(value);
        update.display_name = trimmedValue || null;
        break;
      case 'username':
        setUsername(value);
        update.username = trimmedValue || 'Racing Driver';
        break;
      case 'bio':
        setBio(value);
        update.bio = trimmedValue || null;
        break;
    }
    
    onUpdate(update);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and how others see you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input 
            id="displayName" 
            placeholder="Enter your display name" 
            value={displayName} 
            onChange={(e) => handleFieldChange('display_name', e.target.value)} 
          />
          <p className="text-xs text-muted-foreground">
            How your name appears to other users
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            placeholder="Enter your username" 
            value={username} 
            onChange={(e) => handleFieldChange('username', e.target.value)} 
          />
          <p className="text-xs text-muted-foreground">
            Your username for leagues and competitions
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea 
            id="bio" 
            placeholder="Tell others about yourself and your racing predictions..." 
            value={bio} 
            onChange={(e) => handleFieldChange('bio', e.target.value)} 
            rows={3} 
          />
          <p className="text-xs text-muted-foreground">
            Optional bio that appears on your profile
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            value={user?.email || ''} 
            disabled 
            className="bg-muted" 
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed from this page
          </p>
        </div>
      </CardContent>
    </Card>
  );
};