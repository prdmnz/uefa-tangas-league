
import React, { useState } from 'react';
import { Team } from '../types';
import { toast } from '@/hooks/use-toast';

interface TeamSelectionProps {
  teams: Team[];
  onTeamSelect: (userId: string, teamId: string) => void;
  onStartDraft: () => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ teams, onTeamSelect, onStartDraft }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const handleTeamSelect = () => {
    if (!selectedTeam) {
      toast({
        title: "Nenhum time selecionado",
        description: "Por favor, selecione um time para continuar",
        variant: "destructive"
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: "Nome não informado",
        description: "Por favor, digite seu nome para continuar",
        variant: "destructive"
      });
      return;
    }

    // Check if team is already assigned
    const team = teams.find(t => t.id === selectedTeam);
    if (team?.assignedTo) {
      toast({
        title: "Time já atribuído",
        description: `${team.name} já está atribuído a outro usuário`,
        variant: "destructive"
      });
      return;
    }

    onTeamSelect(userName, selectedTeam);
    toast({
      title: "Time selecionado",
      description: `Você selecionou ${teams.find(t => t.id === selectedTeam)?.name}`,
    });
  };

  const availableTeams = teams.filter(team => !team.assignedTo);
  const assignedTeams = teams.filter(team => team.assignedTo);

  return (
    <div className="glass shadow-soft rounded-lg p-6 animate-fade-in">
      <h2 className="text-xl font-medium mb-4">Selecione Seu Time</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
            Seu Nome
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite seu nome"
          />
        </div>
        
        <div>
          <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Selecione o Time
          </label>
          <select
            id="teamSelect"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione um time</option>
            {availableTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleTeamSelect}
          className="w-full button-transition focus-ring px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        >
          Confirmar Seleção
        </button>
      </div>
      
      {assignedTeams.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Times Já Selecionados</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {assignedTeams.map(team => (
                <li key={team.id} className="flex justify-between items-center px-3 py-2 bg-white rounded shadow-sm">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-sm text-gray-500">{team.assignedTo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {assignedTeams.length === teams.length && (
        <div className="mt-6">
          <button
            onClick={onStartDraft}
            className="w-full button-transition focus-ring px-4 py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800"
          >
            Todos os Times Selecionados - Iniciar Draft
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamSelection;
