import React, { useState, useContext, useEffect } from 'react';
import { Lesson, QuizQuestion, AppContextType } from '../types';
import { AppContext } from '../App';

interface QuizLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

const QuizLesson: React.FC<QuizLessonProps> = ({ lesson, onComplete }) => {
  const context = useContext(AppContext) as AppContextType;
  const allQuestions = lesson.content as QuizQuestion[];

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    if (!context || !context.user) return;
    const { user } = context;

    const performances = Object.values(user.performance);
    const totalScore = performances.reduce((acc, p) => acc + p.score, 0);
    const avgSkill = performances.length > 0 ? totalScore / performances.length : 0.3; 

    let difficultyThreshold = 1;
    if (avgSkill >= 0.5) difficultyThreshold = 2;
    if (avgSkill >= 0.8) difficultyThreshold = 3;

    const filteredQuestions = allQuestions
        .filter(q => q.difficulty <= difficultyThreshold);
    
    let finalQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    
    if(finalQuestions.length === 0 && allQuestions.length > 0) {
      finalQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
    }

    setActiveQuestions(finalQuestions);
    setStartTime(Date.now());
  }, [allQuestions, context]);

  if (!context || !context.user) {
    return <div className="p-6 text-center">Error al cargar datos del usuario.</div>;
  }

  if (activeQuestions.length === 0) {
    return <div className="p-6 text-center">Cargando preguntas...</div>;
  }
  
  const { completeLesson } = context;
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000;
      const finalScore = activeQuestions.length > 0 ? score / activeQuestions.length : 0;
      
      completeLesson(lesson, { score: finalScore, time: elapsedTime });
      onComplete();
    }
  };
  
  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return selectedAnswer === index 
        ? 'bg-sky-500 border-sky-600 text-white' 
        : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800';
    }
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-200 border-green-400 text-green-800';
    }
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'bg-red-200 border-red-400 text-red-800';
    }
    return 'bg-slate-100 border-slate-300 text-slate-500';
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswer];

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-center mb-2">{lesson.title}</h3>
      <p className="text-center text-slate-500 mb-6">Pregunta {currentQuestionIndex + 1} de {activeQuestions.length}</p>

      <div className="bg-white p-6 rounded-lg shadow-inner">
        <p className="text-lg font-semibold text-slate-800 mb-6 text-center">{currentQuestion.question}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-lg border-2 font-semibold transition-colors duration-200 ${getButtonClass(index)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isAnswered && (
        <div className={`mt-4 p-4 rounded-lg text-center ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCorrect ? (
                <>
                    <h4 className="font-bold">¡Correcto!</h4>
                    <p className="text-sm mt-1">{currentQuestion.explanation}</p>
                </>
            ) : (
                <>
                    <h4 className="font-bold">¡Incorrecto!</h4>
                    <p className="text-sm mt-2">
                        La respuesta correcta era: <strong>"{correctAnswerText}"</strong>.
                    </p>
                    <p className="text-sm mt-1">{currentQuestion.explanation}</p>
                </>
            )}
        </div>
      )}
      
      <div className="mt-6 flex justify-center">
        {!isAnswered ? (
          <button 
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className="w-full md:w-auto bg-blue-500 text-white font-bold py-3 px-8 rounded-full disabled:bg-slate-300 transition-colors"
          >
            Comprobar
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion}
            className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            {currentQuestionIndex < activeQuestions.length - 1 ? 'Siguiente' : 'Finalizar'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizLesson;
