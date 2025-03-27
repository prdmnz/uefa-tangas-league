
import React from 'react';
import { DraftStatus } from '../types';
import { Play, Pause, RotateCcw, RefreshCw } from 'lucide-react';

interface NavigationProps {
  draftStatus: DraftStatus;
  onStartDraft: () => void;
  onResetDraft: () => void;
  onPauseDraft: () => void;
  onResumeDraft: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  draftStatus,
  onStartDraft,
  onResetDraft,
  onPauseDraft,
  onResumeDraft
}) => {
  return (
    <header className="w-full glass shadow-soft mb-6 px-6 py-4 rounded-lg animate-fade-in border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider font-serif">
            UEFA Tangas League
          </h1>
          
          <div className="ml-4 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            9 Times
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {draftStatus === DraftStatus.NOT_STARTED && (
            <button
              onClick={onStartDraft}
              className="button-transition focus-ring px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 flex items-center gap-2"
            >
              <Play size={16} />
              Iniciar Draft
            </button>
          )}
          
          {draftStatus === DraftStatus.IN_PROGRESS && (
            <button
              onClick={onPauseDraft}
              className="button-transition focus-ring px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 active:bg-amber-700 flex items-center gap-2"
            >
              <Pause size={16} />
              Pausar Draft
            </button>
          )}
          
          {draftStatus === DraftStatus.PAUSED && (
            <button
              onClick={onResumeDraft}
              className="button-transition focus-ring px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 active:bg-green-700 flex items-center gap-2"
            >
              <Play size={16} />
              Continuar Draft
            </button>
          )}
          
          {draftStatus !== DraftStatus.NOT_STARTED && (
            <button
              onClick={onResetDraft}
              className="button-transition focus-ring px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reiniciar Draft
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
