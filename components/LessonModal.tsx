import React, { useState, useContext } from 'react';
import { Module, Lesson, LessonType, AppContextType } from '../types';
import { XMarkIcon, PlayCircleIcon, PuzzlePieceIcon, CheckBadgeIcon, RocketLaunchIcon } from './icons';
import QuizLesson from './QuizLesson';
import VideoLesson from './VideoLesson';
import GameLesson from './GameLesson';
import MissionLesson from './MissionLesson';
import { AppContext } from '../App';

interface LessonModalProps {
  module: Module;
  onClose: () => void;
}

const LESSON_ICONS = {
  [LessonType.VIDEO]: PlayCircleIcon,
  [LessonType.GAME]: PuzzlePieceIcon,
  [LessonType.QUIZ]: CheckBadgeIcon,
  [LessonType.MISSION]: RocketLaunchIcon,
};

const LessonModal: React.FC<LessonModalProps> = ({ module, onClose }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const context = useContext(AppContext) as AppContextType;

  const handleLessonComplete = () => {
    setActiveLesson(null);
  };
  
  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const renderContent = () => {
    if (activeLesson) {
      switch (activeLesson.type) {
        case LessonType.QUIZ:
          return <QuizLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
        case LessonType.VIDEO:
          return <VideoLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
        case LessonType.GAME:
          return <GameLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
        case LessonType.MISSION:
          return <MissionLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
        default:
          setActiveLesson(null);
          return null;
      }
    }

    if (!context || !context.user) {
        return <div className="p-6 text-center">Cargando...</div>;
    }
    const { user } = context;


    return (
      <>
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{module.title}</h2>
            <p className="text-slate-500 mt-1">Completa las lecciones para dominar este tema.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
            <XMarkIcon className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
            {module.lessons.length > 0 ? module.lessons.map(lesson => {
                const Icon = LESSON_ICONS[lesson.type];
                const isCompleted = user.completedLessons.has(lesson.id);
                return (
                    <div key={lesson.id} className={`flex items-center justify-between p-4 rounded-lg border-2 ${isCompleted ? 'border-green-300 bg-green-50' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                            <Icon className={`w-8 h-8 ${isCompleted ? 'text-green-500' : 'text-sky-500'}`} />
                            <div>
                                <h4 className={`font-bold ${isCompleted ? 'text-green-800' : 'text-slate-700'}`}>{lesson.title}</h4>
                                <p className="text-sm text-slate-500">{lesson.duration} min • {lesson.xp} XP</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleStartLesson(lesson)} 
                            disabled={isCompleted}
                            className={`font-bold py-2 px-4 rounded-full text-sm transition-colors ${isCompleted ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-sky-500 text-sky-500 hover:bg-sky-50'}`}
                        >
                            {isCompleted ? 'Completado' : 'Empezar'}
                        </button>
                    </div>
                );
            }) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Próximamente... ¡Nuevas lecciones en camino!</p>
              </div>
            )}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default LessonModal;
