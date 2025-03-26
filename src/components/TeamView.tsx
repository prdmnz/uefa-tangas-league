
import React, { useState } from 'react';
import { Team } from '../types';

interface TeamViewProps {
  teams: Team[];
}

const TeamView: React.FC<TeamViewProps> = ({ teams }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value);
  };
  
  const selectedTeamData = teams.find(team => team.id === selectedTeam) || null;
  
  // Group players by position for better display
  const playersByPosition: Record<string, typeof selectedTeamData['players']> = {};
  
  if (selectedTeamData) {
    selectedTeamData.players.forEach(playerInfo => {
      const position = playerInfo.player.position;
      if (!playersByPosition[position]) {
        playersByPosition[position] = [];
      }
      playersByPosition[position].push(playerInfo);
    });
  }
  
  // Sort positions in a logical order
  const positionOrder = {
    'GK': 1, 
    'CB': 2, 'LB': 3, 'RB': 4, 
    'CDM': 5, 'CM': 6, 'CAM': 7, 
    'LM': 8, 'RM': 9, 
    'LW': 10, 'RW': 11, 'ST': 12
  };
  
  const sortedPositions = Object.keys(playersByPosition).sort((a, b) => {
    return (positionOrder[a as keyof typeof positionOrder] || 99) - 
           (positionOrder[b as keyof typeof positionOrder] || 99);
  });
  
  return (
    <div className="glass shadow-soft rounded-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-medium mb-4">Team Overview</h2>
        
        <select
          value={selectedTeam || ''}
          onChange={handleTeamChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name} {team.draftPosition ? `(Pick #${team.draftPosition})` : ''}
            </option>
          ))}
        </select>
      </div>
      
      {selectedTeamData && (
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">{selectedTeamData.name}</h3>
            <div className="text-sm text-gray-600">
              Draft Position: {selectedTeamData.draftPosition || 'Not assigned yet'}
            </div>
            <div className="text-sm text-gray-600">
              Players Drafted: {selectedTeamData.players.length}
            </div>
          </div>
          
          {selectedTeamData.players.length > 0 ? (
            <div className="space-y-4">
              {sortedPositions.map(position => (
                <div key={position} className="animate-fade-in">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {position} ({playersByPosition[position].length})
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-2">
                      {playersByPosition[position].map(playerInfo => (
                        <div 
                          key={playerInfo.player.id}
                          className="flex items-center justify-between px-3 py-2 bg-white rounded-md shadow-sm"
                        >
                          <div>
                            <div className="font-medium">{playerInfo.player.name}</div>
                            <div className="text-xs text-gray-500">{playerInfo.player.team}</div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                              Pick #{playerInfo.pickNumber}
                            </div>
                            <div className="font-mono font-medium">
                              {playerInfo.player.ovr}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              This team hasn't drafted any players yet.
            </div>
          )}
        </div>
      )}
      
      {!selectedTeamData && (
        <div className="p-10 text-center text-gray-500">
          Select a team to view their drafted players.
        </div>
      )}
    </div>
  );
};

export default TeamView;
