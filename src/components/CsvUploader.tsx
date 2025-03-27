import React, { useState } from 'react';
import { Player, FieldPlayerStats, GKStats } from '../types';
import { Input } from './ui/input';
import { toast } from '@/hooks/use-toast';
import ExampleCsv from './ExampleCsv';
import { useRealTime } from '../context/RealTimeContext';

interface CsvUploaderProps {
  onPlayersLoaded: (players: Player[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onPlayersLoaded }) => {
  const [isLoadingField, setIsLoadingField] = useState(false);
  const [isLoadingGK, setIsLoadingGK] = useState(false);
  const [fieldPlayers, setFieldPlayers] = useState<Player[]>([]);
  const [goalkeepers, setGoalkeepers] = useState<Player[]>([]);
  
  const { uploadCsv } = useRealTime();

  const parseCsvToFieldPlayers = (csvContent: string): Player[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const players: Player[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const player: any = { id: `csv-field-${i}` };
      
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
        if (player.position !== 'GK') {
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
          players.push(player as Player);
        }
      }
    }
    
    return players;
  };

  const parseCsvToGoalkeepers = (csvContent: string): Player[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const players: Player[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const player: any = { id: `csv-gk-${i}` };
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        if (!value) return;
        
        if (['ovr'].includes(header)) {
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
          players.push(player as Player);
        }
      }
    }
    
    return players;
  };
  
  const handleFieldPlayerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoadingField(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const players = parseCsvToFieldPlayers(csvContent);
        
        if (players.length > 0) {
          setFieldPlayers(players);
          
          if (goalkeepers.length > 0) {
            const allPlayers = [...players, ...goalkeepers];
            onPlayersLoaded(allPlayers);
            uploadCsv(allPlayers);
            toast({
              title: "CSVs importados com sucesso",
              description: `${players.length} jogadores de linha e ${goalkeepers.length} goleiros foram importados e sincronizados com todos os usuários.`,
            });
          } else {
            toast({
              title: "Jogadores de linha importados",
              description: `${players.length} jogadores de linha foram importados. Falta importar goleiros.`,
            });
          }
        } else {
          toast({
            title: "Erro na importação",
            description: "Nenhum jogador de linha válido encontrado no arquivo CSV.",
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
        setIsLoadingField(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erro na leitura do arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive"
      });
      setIsLoadingField(false);
    };
    
    reader.readAsText(file);
  };

  const handleGoalkeeperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoadingGK(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const players = parseCsvToGoalkeepers(csvContent);
        
        if (players.length > 0) {
          setGoalkeepers(players);
          
          if (fieldPlayers.length > 0) {
            const allPlayers = [...fieldPlayers, ...players];
            onPlayersLoaded(allPlayers);
            uploadCsv(allPlayers);
            toast({
              title: "CSVs importados com sucesso",
              description: `${fieldPlayers.length} jogadores de linha e ${players.length} goleiros foram importados e sincronizados com todos os usuários.`,
            });
          } else {
            toast({
              title: "Goleiros importados",
              description: `${players.length} goleiros foram importados. Falta importar jogadores de linha.`,
            });
          }
        } else {
          toast({
            title: "Erro na importação",
            description: "Nenhum goleiro válido encontrado no arquivo CSV.",
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
        setIsLoadingGK(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erro na leitura do arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive"
      });
      setIsLoadingGK(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-soft">
        <h3 className="font-medium text-lg mb-2">Importar Jogadores (CSV)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Faça upload de dois arquivos CSV separados: um para jogadores de linha e outro para goleiros.
        </p>
        
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h4 className="font-medium mb-2">Jogadores de Linha:</h4>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFieldPlayerUpload}
                disabled={isLoadingField}
                className="cursor-pointer"
              />
              {isLoadingField && <p className="text-sm text-blue-600">Processando arquivo...</p>}
              {fieldPlayers.length > 0 && (
                <p className="text-sm text-green-600">{fieldPlayers.length} jogadores de linha importados</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Goleiros:</h4>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleGoalkeeperUpload}
                disabled={isLoadingGK}
                className="cursor-pointer"
              />
              {isLoadingGK && <p className="text-sm text-blue-600">Processando arquivo...</p>}
              {goalkeepers.length > 0 && (
                <p className="text-sm text-green-600">{goalkeepers.length} goleiros importados</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <ExampleCsv />
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-soft">
        <h4 className="font-medium mb-2">Formato de exemplo:</h4>
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-medium">Jogadores de Linha:</h5>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              name,position,team,ovr,height,weight,skillMoves,stats.pace,stats.shooting,stats.passing,stats.dribbling,stats.defense,stats.physical<br/>
              Lionel Messi,RW,Inter Miami CF,90,170cm,72kg,5,85,92,91,94,34,68
            </pre>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Goleiros:</h5>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              name,position,team,ovr,height,weight,stats.elasticity,stats.handling,stats.shooting,stats.reflexes,stats.speed,stats.positioning<br/>
              Alisson Becker,GK,Liverpool FC,89,191cm,91kg,85,88,84,89,86,88
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploader;
