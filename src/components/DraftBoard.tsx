
import React from 'react';
import { DraftPick, Team } from '../types';
import Timer from './Timer';
import { getPositionColor } from '../utils/draftUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Trophy, Clock, ArrowUp, ArrowDown } from 'lucide-react';

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
    <div className="glass shadow-xl rounded-lg overflow-hidden animate-fade-in relative border border-blue-200/50">
      <div className="p-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Draft Board
          </h2>
          
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
        <div className="min-w-full">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-20 shadow-sm">
              <TableRow className="border-b border-blue-200/50">
                <TableHead className="w-16 py-3 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Pick
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Team
                </TableHead>
                <TableHead className="w-20 py-3 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Pos
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Player
                </TableHead>
                <TableHead className="w-16 py-3 px-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  OVR
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePicks.map((pick, index) => {
                const isCurrentPick = index === currentPick;
                const positionColor = pick.player ? getPositionColor(pick.player.position) : '';
                const roundIsEven = pick.round % 2 === 0;
                
                // Determine row appearance based on round (snake draft visualization)
                const rowDirection = roundIsEven ? 
                  <ArrowUp size={12} className="text-blue-500/70" /> : 
                  <ArrowDown size={12} className="text-blue-500/70" />;
                
                return (
                  <TableRow 
                    key={pick.overall}
                    className={`
                      transition-all duration-300 backdrop-blur-sm
                      ${isCurrentPick ? 'bg-gradient-to-r from-blue-100/80 to-blue-50/80 shadow-sm' : 
                        index % 2 === 0 ? 'bg-white/60' : 'bg-blue-50/30'}
                      ${isCurrentPick ? 'animate-pulse-soft border-l-4 border-l-blue-500' : ''}
                      hover:bg-blue-50/60
                    `}
                  >
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-sm font-medium">
                          {pick.overall}
                        </span>
                        
                        <span className="ml-1.5 flex-shrink-0">
                          {roundIsEven ? (
                            <span className="text-xs text-blue-500/70 flex items-center gap-0.5">
                              {rowDirection} R{pick.round}
                            </span>
                          ) : (
                            <span className="text-xs text-blue-500/70 flex items-center gap-0.5">
                              {rowDirection} R{pick.round}
                            </span>
                          )}
                        </span>
                        
                        {isCurrentPick && (
                          <span className="ml-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {pick.team.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pick {pick.pickInRound} in Round {pick.round}
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
                        <span className={`text-gray-400 ${isCurrentPick ? 'animate-pulse font-medium' : ''}`}>
                          {isCurrentPick ? 'On the clock...' : '—'}
                        </span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      {pick.player ? (
                        <span className="font-mono font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                          {pick.player.ovr}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DraftBoard;
