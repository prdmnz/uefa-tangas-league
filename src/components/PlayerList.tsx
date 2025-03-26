
import React, { useState } from "react";
import { Player } from "../types";
import { filterPlayers, getUniquePositions, getUniqueTeams, isGoalkeeper } from "../utils/draftUtils";

interface PlayerListProps {
  players: Player[];
  onSelectPlayer: (playerId: string) => void;
  disabled: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onSelectPlayer, disabled }) => {
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"name" | "ovr" | "position">("ovr");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const positions = ["", ...getUniquePositions(players)];
  const teams = ["", ...getUniqueTeams(players)];

  // Filter players
  const filteredPlayers = filterPlayers(players, search, positionFilter, teamFilter);

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "position") {
      return sortDirection === "asc"
        ? a.position.localeCompare(b.position)
        : b.position.localeCompare(a.position);
    } else {
      // Default sort by OVR
      return sortDirection === "asc" ? a.ovr - b.ovr : b.ovr - a.ovr;
    }
  });

  const handleSort = (field: "name" | "ovr" | "position") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  return (
    <div className="glass shadow-soft rounded-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-medium mb-4">Available Players</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Positions</option>
              {positions.filter(p => p !== "").map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Teams</option>
              {teams.filter(t => t !== "").map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="scrollbar-thin overflow-y-auto" style={{ maxHeight: "45vh" }}>
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("position")}
              >
                <div className="flex items-center">
                  <span>Pos</span>
                  {sortField === "position" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {sortField === "name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("ovr")}
              >
                <div className="flex items-center">
                  <span>OVR</span>
                  {sortField === "ovr" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPlayers.map((player) => {
              const isExpanded = expandedPlayer === player.id;
              const isGK = isGoalkeeper(player);

              return (
                <React.Fragment key={player.id}>
                  <tr className="transition-colors hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                        {player.position}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.team}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {player.ovr}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          className="button-transition focus-ring px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 text-gray-700"
                          onClick={() => togglePlayerExpanded(player.id)}
                        >
                          {isExpanded ? "Hide" : "Details"}
                        </button>
                        <button
                          className={`
                            button-transition focus-ring px-3 py-1 text-xs rounded-md 
                            ${disabled 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'}
                          `}
                          onClick={() => !disabled && onSelectPlayer(player.id)}
                          disabled={disabled}
                        >
                          Draft
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-3 px-4">
                        <div className="animate-scale-in">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Player Info
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-500">Height:</div>
                                <div>{player.height || "N/A"}</div>
                                <div className="text-gray-500">Weight:</div>
                                <div>{player.weight || "N/A"}</div>
                                <div className="text-gray-500">Skill Moves:</div>
                                <div>
                                  {player.skillMoves ? (
                                    <div className="flex">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span
                                          key={i}
                                          className={`text-sm ${
                                            i < (player.skillMoves || 0)
                                              ? "text-yellow-500"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    "N/A"
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Attributes
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {isGK ? (
                                  <>
                                    <div className="text-gray-500">Elasticity:</div>
                                    <div>
                                      {(player.stats as any).elasticity || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Handling:</div>
                                    <div>
                                      {(player.stats as any).handling || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Shooting:</div>
                                    <div>
                                      {(player.stats as any).shooting || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Reflexes:</div>
                                    <div>
                                      {(player.stats as any).reflexes || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Speed:</div>
                                    <div>
                                      {(player.stats as any).speed || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Positioning:</div>
                                    <div>
                                      {(player.stats as any).positioning || "N/A"}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-gray-500">Pace:</div>
                                    <div>
                                      {(player.stats as any).pace || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Shooting:</div>
                                    <div>
                                      {(player.stats as any).shooting || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Passing:</div>
                                    <div>
                                      {(player.stats as any).passing || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Dribbling:</div>
                                    <div>
                                      {(player.stats as any).dribbling || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Defense:</div>
                                    <div>
                                      {(player.stats as any).defense || "N/A"}
                                    </div>
                                    <div className="text-gray-500">Physical:</div>
                                    <div>
                                      {(player.stats as any).physical || "N/A"}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filteredPlayers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No players found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerList;
