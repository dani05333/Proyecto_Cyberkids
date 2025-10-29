
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Module, Lesson, AppContextType } from '../types';
import { XMarkIcon, LockIcon, CheckCircleIcon } from './icons';

import QuizLesson from './QuizLesson';
import VideoLesson from './VideoLesson';
import GameLesson from './GameLesson';
import MissionLesson from './MissionLesson';
import PracticeCaseLesson from './PracticeCaseLesson';

interface LessonModalProps {
  module: Module;
  onClose: () => void;
}

const LessonModal: React.FC<LessonModalProps> = ({ module, onClose }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const context = useContext(AppContext) as AppContextType;

  if (!context || !context.user) {
    return null; // Or a loading state
  }
  const { user } = context;

  const handleLessonClick = (lesson: Lesson) => {
    // Basic progression: for now, allow any lesson to be clicked.
    // In a real scenario, you'd check if previous lessons in the module are complete.
    setActiveLesson(lesson);
  };

  const handleLessonComplete = () => {
    // After completing a lesson, go back to the lesson list for the module
    setActiveLesson(null);
  };
  
  const renderLessonContent = () => {
    if (!activeLesson) return null;

    switch (activeLesson.type) {
      case 'quiz':
        return <QuizLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
      case 'video':
        return <VideoLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
      case 'game':
        return <GameLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
      case 'mission':
        return <MissionLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
      case 'practice-case':
        return <PracticeCaseLesson lesson={activeLesson} onComplete={handleLessonComplete} />;
      default:
        return <p>Tipo de lección no soportado.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">{activeLesson ? activeLesson.title : module.title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
            <XMarkIcon className="w-6 h-6 text-slate-600" />
          </button>
        </header>

        <main className="overflow-y-auto">
          {activeLesson ? (
            renderLessonContent()
          ) : (
            <div className="p-6">
              <p className="text-slate-600 mb-6">{module.description}</p>
              <ul className="space-y-3">
                {module.lessons.map((lesson, index) => {
                  const isCompleted = user.completedLessons.has(lesson.id);
                  // Simple lock logic: next lesson unlocks when previous is done. First is always unlocked.
                  const isLocked = index > 0 && !user.completedLessons.has(module.lessons[index-1].id);
                  return (
                    <li key={lesson.id}>
                      <button 
                        onClick={() => !isLocked && handleLessonClick(lesson)}
                        disabled={isLocked}
                        className="w-full text-left flex items-center gap-4 p-4 rounded-lg bg-white border-2 border-slate-200 hover:border-sky-400 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:hover:border-slate-200 transition-colors"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${isCompleted ? 'bg-green-500' : isLocked ? 'bg-slate-400' : 'bg-sky-500'}`}>
                          {isCompleted ? <CheckCircleIcon className="w-5 h-5"/> : isLocked ? <LockIcon className="w-5 h-5"/> : <span>{index + 1}</span>}
                        </div>
                        <div className="flex-grow">
                            <h3 className={`font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{lesson.title}</h3>
                            <p className="text-sm text-slate-500">+{lesson.xp} XP</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LessonModal;
