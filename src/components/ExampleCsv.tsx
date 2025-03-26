
import React from 'react';

const ExampleCsv: React.FC = () => {
  const handleDownloadExample = () => {
    // Create a blob with the CSV content
    const csvContent = `name,position,team,ovr,height,weight,skillMoves,stats.pace,stats.shooting,stats.passing,stats.dribbling,stats.defense,stats.physical
Lionel Messi,RW,Inter Miami CF,90,170cm,72kg,5,85,92,91,94,34,68
Cristiano Ronaldo,ST,Al Nassr,86,187cm,85kg,5,81,92,78,85,30,77
Kylian Mbappé,ST,Real Madrid,91,178cm,73kg,5,97,89,80,92,36,78
Erling Haaland,ST,Manchester City,91,194cm,88kg,3,89,93,66,80,45,88
Kevin De Bruyne,CAM,Manchester City,91,181cm,70kg,4,72,86,93,88,64,78
Manuel Neuer,GK,Bayern Munich,88,193cm,92kg,1,90,91,80,92,85,89`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exemplo-jogadores.csv');
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownloadExample}
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
      Baixar CSV de exemplo
    </button>
  );
};

export default ExampleCsv;
