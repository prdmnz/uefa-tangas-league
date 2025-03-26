
import React, { useState } from 'react';
import { randomizeDraftOrder } from '../utils/draftUtils';
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
    
    // Play randomization animation
    const shuffleAnimation = Array.from({ length: 10 }).map((_, i) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          const tempRandomized = randomizeDraftOrder(teams);
          onRandomize(tempRandomized);
          resolve();
        }, i * 100);
      });
    });
    
    // After animation completes, set the final order
    Promise.all(shuffleAnimation).then(() => {
      const finalRandomized = randomizeDraftOrder(teams);
      onRandomize(finalRandomized);
      setIsAnimating(false);
    });
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
