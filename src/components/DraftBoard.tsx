
import React from 'react';
import { DraftPick, Team } from '../types';
import Timer from './Timer';
import { getPositionColor } from '../utils/draftUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';

interface DraftBoardProps {
  picks: DraftPick[];
  currentPick: number;
  isActive: boolean;
  timePerPick: number;
  onTimerComplete: () => void;
  startTime?: Date;
}

const DraftBoard: React.FC<DraftBoardProps> = ({
  picks,
  currentPick,
  isActive,
  timePerPick,
  onTimerComplete,
  startTime
}) => {
  // Determine which picks to show
  const visiblePicks = picks.slice(0, currentPick + 10);
  
  return (
    <div className="glass shadow-soft rounded-lg overflow-hidden animate-fade-in relative">
      <div className="p-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Draft Board</h2>
          
          {currentPick < picks.length && (
            <div className="w-48">
              <Timer 
                key={`draftboard-timer-${currentPick}`}
                initialSeconds={timePerPick} 
                isRunning={isActive}
                onComplete={onTimerComplete}
                startTime={startTime}
              />
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-16 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pick
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </TableHead>
              <TableHead className="w-20 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pos
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </TableHead>
              <TableHead className="w-16 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OVR
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePicks.map((pick, index) => {
              const isCurrentPick = index === currentPick;
              const positionColor = pick.player ? getPositionColor(pick.player.position) : '';
              
              return (
                <TableRow 
                  key={pick.overall}
                  className={`
                    transition-gpu ${isCurrentPick ? 'bg-blue-50' : ''}
                    ${isCurrentPick ? 'animate-pulse-soft' : ''}
                  `}
                >
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono text-sm">
                        {pick.overall}
                      </span>
                      
                      {isCurrentPick && (
                        <span className="ml-1 flex-shrink-0 h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {pick.team.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Round {pick.round}, Pick {pick.pickInRound}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {pick.player ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${positionColor}`}>
                        {pick.player.position}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {pick.player ? (
                      <div className="font-medium">
                        {pick.player.name}
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        {isCurrentPick ? 'On the clock...' : '—'}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-3 px-4 whitespace-nowrap font-mono">
                    {pick.player ? pick.player.ovr : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default DraftBoard;
