
import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/draftUtils';

interface TimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
  startTime?: Date;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, isRunning, onComplete, startTime }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  // Se houver um startTime, calcule o tempo restante
  useEffect(() => {
    if (startTime) {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const remainingSeconds = Math.max(0, initialSeconds - elapsedSeconds);
      
      setSeconds(remainingSeconds);
      
      // Se o tempo já acabou, acione o callback de conclusão
      if (remainingSeconds <= 0 && isRunning) {
        onComplete();
      }
    } else {
      setSeconds(initialSeconds);
    }
  }, [initialSeconds, startTime, isRunning, onComplete]);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            clearInterval(interval);
            onComplete();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds, onComplete]);

  // Calculate percentage for progress
  const percentage = (seconds / initialSeconds) * 100;
  
  // Determine color based on time remaining
  const getTimerColor = () => {
    if (percentage > 50) return 'bg-blue-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className={`font-mono text-lg font-semibold ${percentage <= 20 ? 'text-red-500 animate-pulse-soft' : ''}`}>
          {formatTime(seconds)}
        </span>
      </div>
      
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getTimerColor()} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;
