
import React, { useState } from 'react';
import { Team } from '../types';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Users, Check, Trophy, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamSelectionProps {
  teams: Team[];
  onTeamSelect: (userName: string, teamId: string) => void;
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

  // Filter out teams with empty IDs and then determine available teams
  const validTeams = teams.filter(team => team.id && team.id.trim() !== '');
  const availableTeams = validTeams.filter(team => !team.assignedTo);
  const assignedTeams = validTeams.filter(team => team.assignedTo);

  return (
    <div className="glass-card p-6 animate-fade-in bg-gradient-to-br from-white/90 to-blue-50/90 shadow-xl">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-blue-800">
        <Trophy size={22} className="text-amber-500" />
        Selecione Seu Time
      </h2>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <UserPlus size={16} className="text-blue-600" />
            Seu Nome
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm"
            placeholder="Digite seu nome"
          />
        </div>
        
        <div>
          <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <ShieldAlert size={16} className="text-blue-600" />
            Selecione o Time
          </label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors shadow-sm">
              <SelectValue placeholder="Selecione um time" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(team => (
                <SelectItem key={team.id} value={team.id || `team-${team.name}`}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleTeamSelect}
          className="w-full h-12 button-transition focus-ring px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Check size={18} />
          Confirmar Seleção
        </Button>
      </div>
      
      {assignedTeams.length > 0 && (
        <div className="mt-7">
          <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-blue-800">
            <Users size={18} className="text-blue-600" />
            Times Já Selecionados
          </h3>
          <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-100 shadow-inner">
            <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
              {assignedTeams.map(team => (
                <li key={team.id} className="flex justify-between items-center px-3 py-2.5 bg-white rounded-md shadow-sm border border-blue-50 transition-all hover:shadow hover:border-blue-100">
                  <span className="font-medium text-blue-900">{team.name}</span>
                  <span className="text-sm bg-blue-100/80 text-blue-700 px-2.5 py-1 rounded-full">{team.assignedTo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {assignedTeams.length === validTeams.length && (
        <div className="mt-7">
          <Button
            onClick={onStartDraft}
            className="w-full h-14 button-transition focus-ring px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 animate-soft-pulse flex items-center justify-center gap-2"
          >
            <Trophy size={20} className="text-yellow-200" />
            Todos os Times Selecionados - Iniciar Draft
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamSelection;
