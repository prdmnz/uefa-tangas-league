
import React from 'react';
import { DraftPick, Team } from '../types';
import Timer from './Timer';
import { formatTime } from '../utils/draftUtils';

interface DraftBoardProps {
  picks: DraftPick[];
  currentPick: number;
  isActive: boolean;
  timePerPick: number;
  onTimerComplete: () => void;
}

const DraftBoard: React.FC<DraftBoardProps> = ({
  picks,
  currentPick,
  isActive,
  timePerPick,
  onTimerComplete
}) => {
  // Determine which picks to show
  const visiblePicks = picks.slice(0, currentPick + 10);
  
  return (
    <div className="glass shadow-soft rounded-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Draft Board</h2>
          
          {currentPick < picks.length && (
            <div className="w-48">
              <Timer 
                initialSeconds={timePerPick} 
                isRunning={isActive}
                onComplete={onTimerComplete}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="scrollbar-thin overflow-y-auto" style={{ maxHeight: "60vh" }}>
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Pick
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Pos
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                OVR
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visiblePicks.map((pick, index) => {
              const isCurrentPick = index === currentPick;
              
              return (
                <tr 
                  key={pick.overall}
                  className={`
                    transition-gpu ${isCurrentPick ? 'bg-blue-50' : ''}
                    ${isCurrentPick ? 'animate-pulse-soft' : ''}
                  `}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono text-sm">
                        {pick.overall}
                      </span>
                      
                      {isCurrentPick && (
                        <span className="ml-1 flex-shrink-0 h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {pick.team.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Round {pick.round}, Pick {pick.pickInRound}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 whitespace-nowrap">
                    {pick.player ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                        {pick.player.position}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  
                  <td className="py-3 px-4 whitespace-nowrap">
                    {pick.player ? (
                      <div className="font-medium">
                        {pick.player.name}
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        {isCurrentPick ? 'On the clock...' : '—'}
                      </span>
                    )}
                  </td>
                  
                  <td className="py-3 px-4 whitespace-nowrap font-mono">
                    {pick.player ? pick.player.ovr : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DraftBoard;
