
import React from 'react';
import { Star, Trophy } from 'lucide-react';

const ChampionsBanner = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-8 px-6 rounded-lg shadow-xl relative overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                size={Math.random() * 20 + 10}
                className="absolute text-white animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  opacity: Math.random() * 0.5 + 0.5,
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/60" />
        </div>
        
        {/* Conteúdo */}
        <div className="relative flex flex-col items-center justify-center space-y-2 z-10">
          <div className="flex items-center justify-center gap-3">
            <Trophy size={40} className="text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider uppercase text-center bg-clip-text bg-gradient-to-br from-white to-gray-300">
              UEFA Tangas League
            </h1>
            <Trophy size={40} className="text-yellow-400" />
          </div>
          
          <div className="text-sm text-blue-100 tracking-widest uppercase mt-1 font-medium">
            O mais prestigiado campeonato do futebol de tangas
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-300 rounded-full" />
            <div className="px-3 py-1 bg-blue-700/50 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase rounded-full border border-blue-500/30">
              Temporada 2023-24
            </div>
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-blue-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionsBanner;
