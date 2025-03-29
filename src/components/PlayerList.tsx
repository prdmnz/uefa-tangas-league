
import React, { useState } from "react";
import { Player } from "../types";
import { filterPlayers, getUniquePositions, getUniqueTeams, isGoalkeeper, getPositionColor } from "../utils/draftUtils";
import { Dices, Search, Filter, SortDesc, SortAsc } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PlayerListProps {
  players: Player[];
  onSelectPlayer: (playerId: string) => void;
  disabled: boolean;
  isUserTurn: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onSelectPlayer, disabled, isUserTurn }) => {
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
    <div className="glass shadow-xl rounded-lg overflow-hidden animate-fade-in border border-blue-100">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Jogadores Disponíveis</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar jogadores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full border-blue-200 focus:ring-blue-500">
                <SelectValue placeholder="Todas as Posições" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Posições</SelectItem>
                {positions.filter(p => p !== "").map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full border-blue-200 focus:ring-blue-500">
                <SelectValue placeholder="Todos os Times" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Times</SelectItem>
                {teams.filter(t => t !== "").map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="scrollbar-thin overflow-y-auto" style={{ maxHeight: "45vh" }}>
        {filteredPlayers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-blue-50/50">
            <Dices className="mx-auto h-12 w-12 text-blue-300 mb-2" />
            <p className="font-medium">Nenhum jogador encontrado</p>
            <p className="text-sm mt-1">Tente ajustar seus filtros de busca</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-blue-100/80 sticky top-0 z-10">
              <tr>
                <th
                  className="py-3 px-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider cursor-pointer hover:bg-blue-200/50"
                  onClick={() => handleSort("position")}
                >
                  <div className="flex items-center">
                    <span>Pos</span>
                    {sortField === "position" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider cursor-pointer hover:bg-blue-200/50"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    <span>Nome</span>
                    {sortField === "name" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider cursor-pointer hover:bg-blue-200/50"
                  onClick={() => handleSort("ovr")}
                >
                  <div className="flex items-center">
                    <span>OVR</span>
                    {sortField === "ovr" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {sortedPlayers.map((player) => {
                const isExpanded = expandedPlayer === player.id;
                const isGK = isGoalkeeper(player);
                const positionClass = getPositionColor(player.position);

                return (
                  <React.Fragment key={player.id}>
                    <tr className="transition-colors hover:bg-blue-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${positionClass}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.team}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`text-sm font-semibold px-2 py-1 rounded ${player.ovr > 85 ? 'bg-green-100 text-green-800' : player.ovr > 75 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {player.ovr}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => togglePlayerExpanded(player.id)}
                          >
                            {isExpanded ? "Esconder" : "Detalhes"}
                          </Button>
                          <Button
                            size="sm"
                            className={`text-xs h-8 ${!isUserTurn && "opacity-70"}`}
                            variant={disabled || !isUserTurn ? "outline" : "default"}
                            onClick={() => !disabled && isUserTurn && onSelectPlayer(player.id)}
                            disabled={disabled || !isUserTurn}
                          >
                            {isUserTurn ? "Selecionar" : "Não é sua vez"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-blue-50/50">
                        <td colSpan={4} className="py-3 px-4">
                          <div className="animate-scale-in">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Informações do Jogador
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-500">Altura:</div>
                                  <div>{player.height || "N/A"}</div>
                                  <div className="text-gray-500">Peso:</div>
                                  <div>{player.weight || "N/A"}</div>
                                  <div className="text-gray-500">Dribles:</div>
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
                                  Atributos
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {isGK ? (
                                    <>
                                      <div className="text-gray-500">Elasticidade:</div>
                                      <div>
                                        {(player.stats as any).elasticity || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Habilidade:</div>
                                      <div>
                                        {(player.stats as any).handling || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Chute:</div>
                                      <div>
                                        {(player.stats as any).shooting || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Reflexos:</div>
                                      <div>
                                        {(player.stats as any).reflexes || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Velocidade:</div>
                                      <div>
                                        {(player.stats as any).speed || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Posicionamento:</div>
                                      <div>
                                        {(player.stats as any).positioning || "N/A"}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-gray-500">Velocidade:</div>
                                      <div>
                                        {(player.stats as any).pace || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Chute:</div>
                                      <div>
                                        {(player.stats as any).shooting || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Passe:</div>
                                      <div>
                                        {(player.stats as any).passing || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Drible:</div>
                                      <div>
                                        {(player.stats as any).dribbling || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Defesa:</div>
                                      <div>
                                        {(player.stats as any).defense || "N/A"}
                                      </div>
                                      <div className="text-gray-500">Físico:</div>
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
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PlayerList;
