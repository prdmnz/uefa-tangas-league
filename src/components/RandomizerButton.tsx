
import React, { useState } from 'react';
import { visualRandomizer } from '../utils/draftUtils';
import { Team } from '../types';
import { useRealTime } from '../context/RealTimeContext';
import { toast } from '@/hooks/use-toast';

interface RandomizerButtonProps {
  teams: Team[];
  onRandomize: (randomized: Team[]) => void;
  disabled: boolean;
}

const RandomizerButton: React.FC<RandomizerButtonProps> = ({ teams, onRandomize, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { randomizeTeams } = useRealTime();

  const handleRandomize = () => {
    if (disabled || isAnimating) return;
    
    // Make sure teams have assignedTo properties before randomizing
    const unassignedTeams = teams.filter(team => !team.assignedTo);
    if (unassignedTeams.length === teams.length) {
      toast({
        title: 'Times não atribuídos',
        description: 'Por favor, selecione os times antes de randomizar',
        variant: 'destructive'
      });
      return;
    }
    
    setIsAnimating(true);
    
    // Generate visual randomization sequences
    const sequences = visualRandomizer(teams, 10);
    
    // Play randomization animation
    let step = 0;
    const animationInterval = setInterval(() => {
      if (step < sequences.length) {
        onRandomize(sequences[step]);
        step++;
      } else {
        clearInterval(animationInterval);
        setIsAnimating(false);
        
        // Synchronize the final randomization with all users via Supabase
        try {
          randomizeTeams(sequences[sequences.length - 1]);
        } catch (error) {
          console.error('Error synchronizing randomization:', error);
          toast({
            title: 'Erro na randomização',
            description: 'Ocorreu um erro ao sincronizar a randomização',
            variant: 'destructive'
          });
        }
      }
    }, 150);
  };

  return (
    <button
      onClick={handleRandomize}
      disabled={disabled}
      className={`
        relative overflow-hidden button-transition focus-ring
        px-4 py-2.5 rounded-lg font-medium text-white
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
        ${isAnimating ? 'shimmer' : ''}
      `}
    >
      {isAnimating ? 'Randomizando...' : 'Randomizar Ordem do Draft'}
    </button>
  );
};

export default RandomizerButton;
