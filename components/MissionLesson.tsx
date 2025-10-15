import React, { useContext, useState } from 'react';
import { Lesson, MissionContent, AppContextType } from '../types';
import { AppContext } from '../App';
import { RocketLaunchIcon } from './icons';
import ConfirmationDialog from './ConfirmationDialog';

interface MissionLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

const MissionLesson: React.FC<MissionLessonProps> = ({ lesson, onComplete }) => {
  const context = useContext(AppContext) as AppContextType;
  const missionContent = lesson.content as MissionContent;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleComplete = () => {
    if (context && context.completeLesson) {
      context.completeLesson(lesson, { score: 1, time: 0 }); // Score 1 for completion
    }
    onComplete();
  };

  const openConfirmation = () => {
    setIsConfirmOpen(true);
  };
  
  const closeConfirmation = () => {
    setIsConfirmOpen(false);
  };

  const confirmCompletion = () => {
    handleComplete();
    closeConfirmation();
  };

  return (
    <>
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-amber-100 rounded-full">
              <RocketLaunchIcon className="w-12 h-12 text-amber-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">{lesson.title}</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">{missionContent.description}</p>
        
        <p className="text-sm text-slate-500 mb-6">
          Esta es una misión especial. ¡Realízala y luego márcala como completada para ganar tu XP!
        </p>

        <div className="flex justify-center">
          <button 
            onClick={openConfirmation}
            className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-colors transform hover:scale-105"
          >
            ¡Misión Cumplida!
          </button>
        </div>
      </div>
      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        onClose={closeConfirmation}
        onConfirm={confirmCompletion}
        title="Confirmar Misión"
        message="¿Has completado la misión? Una vez confirmada, recibirás tu recompensa."
      />
    </>
  );
};

export default MissionLesson;
