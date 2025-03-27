
import React, { useState } from 'react';
import { visualRandomizer } from '../utils/draftUtils';
import { Team } from '../types';

interface RandomizerButtonProps {
  teams: Team[];
  onRandomize: (randomized: Team[]) => void;
  disabled: boolean;
}

const RandomizerButton: React.FC<RandomizerButtonProps> = ({ teams, onRandomize, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRandomize = () => {
    if (disabled || isAnimating) return;
    
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
      {isAnimating ? 'Randomizing...' : 'Randomize Draft Order'}
    </button>
  );
};

export default RandomizerButton;
