import React, { useState } from 'react';
import { Player, FieldPlayerStats, GKStats } from '../types';
import { Input } from './ui/input';
import { toast } from '@/hooks/use-toast';
import ExampleCsv from './ExampleCsv';

interface CsvUploaderProps {
  onPlayersLoaded: (players: Player[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onPlayersLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);

  const parseCsvToPlayers = (csvContent: string): Player[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const players: Player[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const player: any = { id: `csv-${i}` };
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        if (!value) return;
        
        if (['ovr', 'skillMoves'].includes(header)) {
          player[header] = parseInt(value);
        } 
        else if (header.startsWith('stats.')) {
          const statName = header.split('.')[1];
          if (!player.stats) {
            player.stats = {};
          }
          player.stats[statName] = parseInt(value);
        } 
        else {
          player[header] = value;
        }
      });
      
      if (player.name && player.position && player.team && player.ovr) {
        if (player.position === 'GK') {
          if (!player.stats || !player.stats.elasticity) {
            player.stats = {
              elasticity: player.stats?.elasticity || 70,
              handling: player.stats?.handling || 70,
              shooting: player.stats?.shooting || 70,
              reflexes: player.stats?.reflexes || 70,
              speed: player.stats?.speed || 70,
              positioning: player.stats?.positioning || 70
            } as GKStats;
          }
        } else {
          if (!player.stats || !player.stats.pace) {
            player.stats = {
              pace: player.stats?.pace || 70,
              shooting: player.stats?.shooting || 70,
              passing: player.stats?.passing || 70,
              dribbling: player.stats?.dribbling || 70,
              defense: player.stats?.defense || 70,
              physical: player.stats?.physical || 70
            } as FieldPlayerStats;
          }
        }
        
        players.push(player as Player);
      }
    }
    
    return players;
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const players = parseCsvToPlayers(csvContent);
        
        if (players.length > 0) {
          onPlayersLoaded(players);
          toast({
            title: "CSV importado com sucesso",
            description: `${players.length} jogadores foram importados.`,
          });
        } else {
          toast({
            title: "Erro na importação",
            description: "Nenhum jogador válido encontrado no arquivo CSV.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Error parsing CSV:", err);
        toast({
          title: "Erro na importação",
          description: "Ocorreu um erro ao analisar o arquivo CSV. Verifique o formato.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erro na leitura do arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive"
      });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-soft">
        <h3 className="font-medium text-lg mb-2">Importar Jogadores (CSV)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Faça upload de um arquivo CSV com os jogadores. O arquivo deve conter cabeçalhos com os campos: 
          name, position, team, ovr, e opcionalmente height, weight, skillMoves e stats.
        </p>
        
        <div className="flex flex-col gap-2">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="cursor-pointer"
          />
          {isLoading && <p className="text-sm text-blue-600">Processando arquivo...</p>}
        </div>
        
        <div className="mt-3">
          <ExampleCsv />
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-soft">
        <h4 className="font-medium mb-2">Formato de exemplo:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
          name,position,team,ovr,height,weight,skillMoves,stats.pace,stats.shooting,stats.passing,stats.dribbling,stats.defense,stats.physical<br/>
          Lionel Messi,RW,Inter Miami CF,90,170cm,72kg,5,85,92,91,94,34,68<br/>
          Manuel Neuer,GK,Bayern Munich,88,193cm,92kg,1,stats.elasticity,stats.handling,stats.shooting,stats.reflexes,stats.speed,stats.positioning<br/>
          Manuel Neuer,GK,Bayern Munich,88,193cm,92kg,1,90,91,80,92,85,89
        </pre>
      </div>
    </div>
  );
};

export default CsvUploader;
