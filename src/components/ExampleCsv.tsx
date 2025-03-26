import React from 'react';

const ExampleCsv: React.FC = () => {
  const handleDownloadFieldPlayers = () => {
    // Create a blob with the CSV content for field players
    const csvContent = `name,position,team,ovr,height,weight,skillMoves,stats.pace,stats.shooting,stats.passing,stats.dribbling,stats.defense,stats.physical
Lionel Messi,RW,Inter Miami CF,90,170cm,72kg,5,85,92,91,94,34,68
Cristiano Ronaldo,ST,Al Nassr,86,187cm,85kg,5,81,92,78,85,30,77
Kylian Mbappé,ST,Real Madrid,91,178cm,73kg,5,97,89,80,92,36,78
Erling Haaland,ST,Manchester City,91,194cm,88kg,3,89,93,66,80,45,88
Kevin De Bruyne,CAM,Manchester City,91,181cm,70kg,4,72,86,93,88,64,78`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exemplo-jogadores-linha.csv');
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGoalkeepers = () => {
    // Create a blob with the CSV content for goalkeepers
    const csvContent = `name,position,team,ovr,height,weight,stats.elasticity,stats.handling,stats.shooting,stats.reflexes,stats.speed,stats.positioning
Alisson Becker,GK,Liverpool FC,89,191cm,91kg,85,88,84,89,86,88
Manuel Neuer,GK,Bayern Munich,88,193cm,92kg,90,91,80,92,85,89
Thibaut Courtois,GK,Real Madrid,90,199cm,96kg,87,90,85,91,79,90
Gianluigi Donnarumma,GK,PSG,88,196cm,90kg,86,87,82,90,81,87
Ederson,GK,Manchester City,88,188cm,86kg,84,86,92,85,90,86`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exemplo-goleiros.csv');
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownloadFieldPlayers}
        className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
          />
        </svg>
        Baixar CSV de exemplo - Jogadores de Linha
      </button>
      <button
        onClick={handleDownloadGoalkeepers}
        className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
          />
        </svg>
        Baixar CSV de exemplo - Goleiros
      </button>
    </div>
  );
};

export default ExampleCsv;
