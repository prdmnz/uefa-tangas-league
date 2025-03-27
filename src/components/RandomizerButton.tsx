
import React, { useState } from 'react';
import { visualRandomizer } from '../utils/draftUtils';
import { Team } from '../types';
import { useRealTime } from '../context/RealTimeContext';
import { toast } from '@/hooks/use-toast';
import { Trophy } from 'lucide-react';

interface RandomizerButtonProps {
  teams: Team[];
  onRandomize: (randomized: Team[]) => void;
  disabled: boolean;
}

const RandomizerButton: React.FC<RandomizerButtonProps> = ({ teams, onRandomize, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { randomizeTeams } = useRealTime();

  const handleRandomize = async () => {
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
          console.error('Erro ao sincronizar randomização:', error);
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
        flex items-center justify-center gap-2
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 active:from-yellow-700 active:to-amber-800 shadow-md hover:shadow-lg'}
        ${isAnimating ? 'shimmer' : ''}
      `}
    >
      <Trophy size={18} className="animate-pulse" />
      {isAnimating ? 'Sorteando...' : 'Sortear Ordem do Draft'}
    </button>
  );
};

export default RandomizerButton;
