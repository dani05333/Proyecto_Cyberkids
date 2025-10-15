import React, { useContext, useState } from 'react';
import { Lesson, VideoContent, AppContextType } from '../types';
import { AppContext } from '../App';
import ConfirmationDialog from './ConfirmationDialog';

interface VideoLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

const VideoLesson: React.FC<VideoLessonProps> = ({ lesson, onComplete }) => {
  const context = useContext(AppContext) as AppContextType;
  const videoContent = lesson.content as VideoContent;
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
      <div className="p-6">
        <h3 className="text-2xl font-bold text-center mb-4">{lesson.title}</h3>
        
        <div className="bg-black rounded-lg overflow-hidden shadow-lg mb-6">
          {videoContent.url ? (
            <video className="w-full aspect-video" controls autoPlay>
              <source src={videoContent.url} type="video/mp4" />
              Tu navegador no soporta la etiqueta de video.
            </video>
          ) : (
            <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
              <p className="text-white">Video no disponible.</p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 mb-6">
          Mira el video para aprender sobre este tema. Cuando termines, márcalo como completado.
        </p>

        <div className="flex justify-center">
          <button 
            onClick={openConfirmation}
            className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-colors"
          >
            Marcar como Completado
          </button>
        </div>
      </div>
      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        onClose={closeConfirmation}
        onConfirm={confirmCompletion}
        title="Confirmar finalización"
        message="¿Estás seguro de que quieres marcar esta lección como completada?"
      />
    </>
  );
};

export default VideoLesson;
