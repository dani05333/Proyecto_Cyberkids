import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Lesson, GameContent, AppContextType } from '../types';
import { AppContext } from '../App';

interface GameLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

// Componente de marcador de posición para juegos no implementados
const PlaceholderGame: React.FC<{description: string, onGameFinish: () => void}> = ({description, onGameFinish}) => {
    useEffect(() => {
        // Para los placeholders, podemos considerar el juego "terminado" al instante
        // para que el usuario solo necesite hacer clic en "Continuar".
        onGameFinish();
    }, [onGameFinish]);

    return (
        <div className="text-center p-4">
            <p className="text-slate-600 mb-4">{description}</p>
            <p className="text-sm text-slate-500 font-semibold mb-6">(Este juego interactivo está en desarrollo)</p>
            <p className="text-sm text-slate-500">¡Puedes continuar con tu aprendizaje!</p>
        </div>
    );
}


const PasswordStrengthGame: React.FC<{onGameFinish: () => void, skill: number, initialState?: string, onStateChange: (newState: string) => void}> = ({onGameFinish, initialState = '', onStateChange}) => {
    const [password, setPassword] = useState(initialState);
    
    // Stricter validation checks
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
    };

    const isStrong = checks.length && checks.uppercase && checks.number;

    useEffect(() => {
        if(isStrong){
            const timer = setTimeout(() => {
                onGameFinish();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isStrong, onGameFinish]);

    const getVisualStrength = () => {
        let strength = 0;
        if (password.length > 5) strength++;
        if (checks.length) strength++;
        if (checks.uppercase) strength++;
        if (checks.number) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };
    
    const strength = getVisualStrength();
    const strengthColors = ['bg-slate-300', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500'];
    const strengthText = ['Muy Débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte', 'Muy Fuerte'];
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        onStateChange(newPassword);
    };

    return (
        <div className="text-center w-full">
            <input 
                type="text"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Escribe una contraseña"
                className="w-full p-3 border-2 border-slate-300 rounded-lg text-center text-lg"
                aria-label="Campo para crear contraseña"
                aria-describedby="password-rules"
            />
            <div className="mt-4 w-full bg-slate-200 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-300 ${strengthColors[strength]}`} style={{width: `${(strength/5) * 100}%`}}></div>
            </div>
            <p className="mt-2 font-bold" style={{color: strengthColors[strength].replace('bg-','').replace('-400','-600').replace('-500','-700')}}>{strengthText[strength]}</p>
            
            {/* Real-time validation checklist */}
            <div id="password-rules" aria-live="polite" className="mt-4 space-y-1 text-left text-sm w-full md:w-2/3 mx-auto">
                <p className={`font-semibold transition-colors ${checks.length ? 'text-green-600' : 'text-slate-500'}`}>
                    {checks.length ? '✓' : '✗'} Al menos 8 caracteres
                </p>
                <p className={`font-semibold transition-colors ${checks.uppercase ? 'text-green-600' : 'text-slate-500'}`}>
                    {checks.uppercase ? '✓' : '✗'} Incluye una mayúscula (A-Z)
                </p>
                <p className={`font-semibold transition-colors ${checks.number ? 'text-green-600' : 'text-slate-500'}`}>
                    {checks.number ? '✓' : '✗'} Incluye un número (0-9)
                </p>
            </div>
            
            {isStrong && <p className="text-green-600 font-bold mt-2">¡Excelente! ¡Esa es una contraseña muy segura!</p>}
        </div>
    );
}

const SpotTheFakeGame: React.FC<{onGameFinish: () => void, skill: number}> = ({onGameFinish, skill}) => {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isFakeFirst] = useState(() => Math.random() > 0.5);

    const scenario = useMemo(() => {
        const scenarios = [
            { // Easy
                fake: { name: 'A_Martinez_123', friends: 0, post: '¡Hola! Gana premios increíbles haciendo clic en el enlace de mi bio. ¡Funciona 100%!', emoji: '🤔' },
                real: { name: 'Ana Martínez', friends: 124, post: '¡Feliz de compartir fotos de mi viaje al sur! 🏞️', emoji: '😊' },
                explanation: '¡Correcto! Este perfil tiene señales de ser falso, como no tener amigos y un mensaje sospechoso.',
            },
            { // Medium
                fake: { name: 'Carlos_G', friends: 15, post: 'Vendo celular nuevo, casi sin uso. Mándame un MD para más info. Solo gente seria.', emoji: '📱' },
                real: { name: 'Carlos González', friends: 88, post: '¡Qué buen partido de fútbol hoy con los amigos!', emoji: '⚽' },
                explanation: '¡Bien hecho! Los perfiles de venta con pocos amigos y urgencia pueden ser una estafa.',
            },
            { // Hard
                fake: { name: 'Javier R.', friends: 48, post: '¡Guau! No puedo creer que esta app para editar fotos sea gratis. Miren los resultados en mi link: bit.ly/foto-editor-pro. ¡Recomendado!', emoji: '📸' },
                real: { name: 'Javier Rojas', friends: 150, post: 'Celebrando el cumpleaños de mi hermana. ¡Qué bien la pasamos en familia! 🎂🎉', emoji: '🥳' },
                explanation: '¡Excelente ojo! Los enlaces acortados de perfiles poco conocidos y los mensajes que parecen anuncios pueden ser una trampa.',
            }
        ];
        
        if (skill > 0.75) return scenarios[2]; // Hard
        if (skill > 0.5) return scenarios[1];  // Medium
        return scenarios[0];                   // Easy
    }, [skill]);

    const firstProfile = isFakeFirst ? scenario.fake : scenario.real;
    const secondProfile = isFakeFirst ? scenario.real : scenario.fake;

    const handleClick = (isCorrectChoice: boolean) => {
        if(answered) return;
        setAnswered(true);
        if (isCorrectChoice) {
            setFeedback(scenario.explanation);
            setTimeout(() => onGameFinish(), 1500);
        } else {
            setFeedback('Intenta de nuevo. Fíjate en los detalles. A veces las pistas son sutiles.');
            setTimeout(() => {
              setAnswered(false);
              setFeedback(null);
            }, 2000);
        }
    };

    const ProfileCard: React.FC<{profile: typeof firstProfile, onClick: () => void}> = ({ profile, onClick }) => (
        <button onClick={onClick} disabled={answered} className="p-4 border-2 border-slate-200 rounded-lg hover:border-sky-500 focus:border-sky-500 transition-all disabled:opacity-70 disabled:hover:border-slate-200 text-left">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-2xl flex-shrink-0">{profile.emoji}</div>
                <div>
                    <p className="font-bold">{profile.name}</p>
                    <p className="text-sm text-slate-500">{profile.friends} amigos</p>
                </div>
            </div>
            <p className="text-sm mt-2">{profile.post}</p>
        </button>
    );

    return (
        <div className="w-full">
            <p className="text-center mb-4 font-semibold">¿Cuál de estos perfiles de red social te parece falso?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileCard profile={firstProfile} onClick={() => handleClick(isFakeFirst)} />
                <ProfileCard profile={secondProfile} onClick={() => handleClick(!isFakeFirst)} />
            </div>
            {feedback && <p aria-live="assertive" className={`text-center mt-4 font-bold ${feedback.startsWith('¡Correcto!') || feedback.startsWith('¡Bien hecho!') || feedback.startsWith('¡Excelente ojo!') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
        </div>
    )
}

const GameLesson: React.FC<GameLessonProps> = ({ lesson, onComplete }) => {
  const context = useContext(AppContext) as AppContextType;
  const gameContent = lesson.content as GameContent;
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const skill = useMemo(() => {
    if (!context || !context.user) return 0.3; // Default skill
    const { user } = context;
    const performances = Object.values(user.performance);
    const totalScore = performances.reduce((acc, p) => acc + p.score, 0);
    return performances.length > 0 ? totalScore / performances.length : 0.3;
  }, [context]);

  const handleComplete = () => {
    if (!context || !context.completeLesson) return;
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000;
    context.completeLesson(lesson, { score: 1, time: elapsedTime }); // Score 1 for successful completion
    onComplete();
  };

  const handleStateChange = (newState: any) => {
    if (!context || !context.saveGameState) return;
    context.saveGameState(lesson.id, newState);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const renderGame = () => {
    if (!context || !context.user) return null;
    const savedState = context.user.gameState?.[lesson.id];

    switch (gameContent.type) {
      case 'password-strength':
        return <PasswordStrengthGame 
            onGameFinish={() => setGameFinished(true)} 
            skill={skill}
            initialState={savedState}
            onStateChange={handleStateChange}
         />;
      case 'spot-the-fake':
        return <SpotTheFakeGame onGameFinish={() => setGameFinished(true)} skill={skill} />;
      default:
        return <PlaceholderGame 
            description={gameContent.description} 
            onGameFinish={() => setGameFinished(true)} 
        />;
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-center mb-2">{lesson.title}</h3>
      <p className="text-center text-slate-500 mb-6">{gameContent.description}</p>
      
      <div className="bg-white p-6 rounded-lg shadow-inner mb-2 min-h-[200px] flex items-center justify-center">
        {renderGame()}
      </div>
      <div className="h-6 text-center">
        {isSaving && <p className="text-sm text-slate-500 animate-pulse">Progreso guardado...</p>}
      </div>

      <div className="flex justify-center mt-2">
        <button 
          onClick={handleComplete}
          disabled={!gameFinished}
          className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-full disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {gameFinished ? '¡Genial! Continuar' : 'Completa el juego'}
        </button>
      </div>
    </div>
  );
};

export default GameLesson;
