import React from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/fantasy/HeroSection';
import RacePrediction from '@/components/fantasy/TeamSelector';
import RaceCalendar from '@/components/fantasy/RaceCalendar';
import Leaderboard from '@/components/fantasy/Leaderboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RacePrediction />
        <RaceCalendar />
        <Leaderboard />
      </main>
    </div>
  );
};

export default Index;
