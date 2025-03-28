
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/draftUtils';

interface TimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
  startTime?: Date;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, isRunning, onComplete, startTime }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<number>();
  const hasExpiredRef = useRef(false);

  // Calculate the remaining time based on startTime
  useEffect(() => {
    // Clear any existing interval when props change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    // Reset expired flag when getting new props
    hasExpiredRef.current = false;
    
    const calculateRemainingTime = () => {
      if (!startTime) {
        setSeconds(initialSeconds);
        return initialSeconds;
      }
      
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const remainingSeconds = Math.max(0, initialSeconds - elapsedSeconds);
      
      setSeconds(remainingSeconds);
      
      // Check if timer has expired
      if (remainingSeconds <= 0 && isRunning && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onComplete();
      }
      
      return remainingSeconds;
    };

    // Calculate initial time
    const initialRemaining = calculateRemainingTime();
    
    // Don't set up interval if already expired
    if (initialRemaining <= 0) {
      return;
    }
    
    // Set up interval for countdown
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        const remaining = calculateRemainingTime();
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialSeconds, isRunning, onComplete, startTime]);

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
