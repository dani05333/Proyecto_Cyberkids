
import React, { useState, useContext } from 'react';
import { Lesson, PracticeCaseContent, AppContextType } from '../types';
import { AppContext } from '../App';

interface PracticeCaseLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

const PracticeCaseLesson: React.FC<PracticeCaseLessonProps> = ({ lesson, onComplete }) => {
  const context = useContext(AppContext) as AppContextType;
  const content = lesson.content as PracticeCaseContent;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] =useState(false);
  const [score, setScore] = useState(0);

  if (!context) {
      return null;
  }

  const { completeLesson } = context;
  const currentQuestion = content.questions[currentStep];

  const handleSelectOption = (option: string) => {
    if(isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    if(selectedOption === currentQuestion.correctOption) {
        setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    if(currentStep < content.questions.length - 1) {
        setCurrentStep(prev => prev + 1);
    } else {
        const finalScore = score / content.questions.length;
        completeLesson(lesson, { score: finalScore, time: 0 });
        onComplete();
    }
  }

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return selectedOption === option
        ? 'bg-sky-500 border-sky-600 text-white' 
        : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800';
    }
    if (option === currentQuestion.correctOption) {
      return 'bg-green-200 border-green-400 text-green-800';
    }
    if (option === selectedOption && option !== currentQuestion.correctOption) {
      return 'bg-red-200 border-red-400 text-red-800';
    }
    return 'bg-slate-100 border-slate-300 text-slate-500';
  };
  
  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-center mb-4 text-slate-800">{lesson.title}</h3>
      <div className="bg-slate-100 p-4 rounded-lg mb-6">
        <h4 className="font-bold text-slate-700">Escenario:</h4>
        <p className="text-slate-600">{content.scenario}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-inner">
        <p className="text-lg font-semibold text-slate-800 mb-6">{currentQuestion.question}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-lg border-2 font-semibold transition-colors duration-200 ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {isAnswered && (
         <div className={`mt-4 p-4 rounded-lg text-center ${selectedOption === currentQuestion.correctOption ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h4 className="font-bold">{selectedOption === currentQuestion.correctOption ? '¡Buena decisión!' : '¡Cuidado!'}</h4>
            <p className="text-sm mt-1">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {!isAnswered ? (
          <button onClick={handleSubmit} disabled={!selectedOption} className="w-full md:w-auto bg-blue-500 text-white font-bold py-3 px-8 rounded-full disabled:bg-slate-300">
            Confirmar Respuesta
          </button>
        ) : (
          <button onClick={handleNext} className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-full">
            {currentStep < content.questions.length - 1 ? 'Siguiente' : 'Finalizar Caso'}
          </button>
        )}
      </div>

    </div>
  );
};

export default PracticeCaseLesson;
