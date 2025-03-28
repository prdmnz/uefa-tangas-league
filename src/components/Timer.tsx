
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/draftUtils';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const completedRef = useRef(false);

  // Calculate the remaining time based on startTime
  useEffect(() => {
    // Clear any existing interval when props change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    // Reset expired flag when getting new props
    hasExpiredRef.current = false;
    completedRef.current = false;
    
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
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }
      
      return remainingSeconds;
    };

    // Calculate initial time
    const initialRemaining = calculateRemainingTime();
    
    // Don't set up interval if already expired
    if (initialRemaining <= 0) {
      if (isRunning && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
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
    if (percentage > 50) return 'bg-emerald-500';
    if (percentage > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Get text color based on time remaining
  const getTextColor = () => {
    if (percentage > 50) return 'text-emerald-700';
    if (percentage > 20) return 'text-amber-700';
    return 'text-red-600';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Clock size={14} className="text-blue-600" />
          Time Remaining
        </span>
        <span className={cn(
          "font-mono text-lg font-semibold",
          getTextColor(),
          percentage <= 20 ? "animate-pulse-soft" : ""
        )}>
          {formatTime(seconds)}
          {percentage <= 20 && (
            <AlertCircle size={14} className="ml-1 inline-block text-red-500" />
          )}
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full ${getTimerColor()} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;
