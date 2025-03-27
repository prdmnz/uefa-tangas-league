
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Player, PlayerStats } from '../types';
import ExampleCsv from './ExampleCsv';
import { toast } from '@/hooks/use-toast';
import { useRealTime } from '../context/RealTimeContext';
import { supabase } from '@/integrations/supabase/client';

interface CsvUploaderProps {
  onPlayersLoaded: (players: Player[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onPlayersLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const { uploadCsv } = useRealTime();

  // Processa e valida players do CSV
  const processAndValidatePlayers = (results: Papa.ParseResult<any>): Player[] => {
    if (!results.data || results.data.length < 2) {
      throw new Error('CSV inválido: Sem dados ou cabeçalho ausente.');
    }

    const processedPlayers: Player[] = [];
    const requiredFields = ['id', 'name', 'position', 'team', 'ovr'];
    
    // Converte linhas CSV em objetos Player
    results.data.forEach((row, index) => {
      // Pula a primeira linha (cabeçalho) e linhas vazias
      if (index === 0 || Object.values(row).every(val => val === '')) {
        return;
      }
      
      // Verifica campos obrigatórios
      const missingFields = requiredFields.filter(field => !row[field] || row[field].trim() === '');
      if (missingFields.length > 0) {
        console.warn(`Linha ${index+1}: Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
        return;
      }
      
      try {
        // Determina se é goleiro ou jogador de campo
        const isGK = row.position === 'GK';
        
        // Constrói objeto de estatísticas com base na posição
        let stats: PlayerStats;
        
        if (isGK) {
          stats = {
            elasticity: parseInt(row.elasticity) || 0, 
            handling: parseInt(row.handling) || 0,
            shooting: parseInt(row.shooting) || 0,
            reflexes: parseInt(row.reflexes) || 0,
            speed: parseInt(row.speed) || 0,
            positioning: parseInt(row.positioning) || 0
          };
        } else {
          stats = {
            pace: parseInt(row.pace) || 0,
            shooting: parseInt(row.shooting) || 0,
            passing: parseInt(row.passing) || 0,
            dribbling: parseInt(row.dribbling) || 0,
            defense: parseInt(row.defense) || 0,
            physical: parseInt(row.physical) || 0
          };
        }
        
        // Cria objeto Player
        const player: Player = {
          id: row.id,
          name: row.name,
          position: row.position,
          team: row.team,
          ovr: parseInt(row.ovr),
          height: row.height,
          weight: row.weight,
          skillMoves: row.skill_moves ? parseInt(row.skill_moves) : undefined,
          stats
        };
        
        processedPlayers.push(player);
      } catch (error) {
        console.error(`Erro ao processar linha ${index+1}:`, error);
      }
    });
    
    return processedPlayers;
  };

  // Processa arquivo CSV quando enviado
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Lê arquivo CSV usando PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Aqui começamos a simulação de progresso
          const simulateProgress = () => {
            setUploadProgress(prev => {
              const next = prev + Math.random() * 15;
              return next < 90 ? next : 90;
            });
          };
          
          // Simula progresso a cada 300ms
          const progressInterval = setInterval(simulateProgress, 300);
          
          // Processa dados do CSV
          const players = processAndValidatePlayers(results);
          
          if (players.length === 0) {
            throw new Error('Nenhum jogador válido encontrado no CSV.');
          }
          
          // Envia dados para o Supabase
          await uploadCsv(players);
          
          // Limpa intervalo e finaliza progresso
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Notifica o componente pai sobre os jogadores carregados
          onPlayersLoaded(players);
          
          toast({
            title: "CSV Importado com Sucesso",
            description: `${players.length} jogadores foram carregados.`,
          });
          
          // Reseta interface após 2 segundos
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }, 2000);
          
        } catch (error: any) {
          console.error('Erro ao processar CSV:', error);
          
          toast({
            title: "Erro ao Processar CSV",
            description: error.message || "Ocorreu um erro ao processar o arquivo CSV.",
            variant: "destructive"
          });
          
          setIsUploading(false);
          setUploadProgress(0);
        }
      },
      error: (error) => {
        console.error('Erro ao ler CSV:', error);
        
        toast({
          title: "Erro ao Ler CSV",
          description: error.message,
          variant: "destructive"
        });
        
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700">
            Selecione um arquivo CSV com jogadores
          </label>
          
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showExample ? 'Esconder Exemplo' : 'Ver Formato do CSV'}
          </button>
        </div>
        
        {showExample && (
          <div className="p-3 bg-gray-50 rounded-md text-xs overflow-x-auto">
            <ExampleCsv />
          </div>
        )}
      </div>
      
      <div className="relative">
        <input
          ref={fileInputRef}
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="button-transition focus-ring w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
        />
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
            <div className="w-full max-w-xs px-4">
              <div className="text-center text-sm mb-2">
                {uploadProgress < 100 ? 'Enviando...' : 'Concluído!'}
                <span className="font-mono ml-1">{Math.round(uploadProgress)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 italic">
        O arquivo deve conter colunas para: id, name, position, team, ovr e estatísticas específicas para cada posição.
      </div>
    </div>
  );
};

export default CsvUploader;
