
import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { AppContext } from '../App';
import { Lesson, AppContextType, GameContent, Performance } from '../types';

interface GameLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

// This list is now updated to include ALL games, unlocking them.
export const DEVELOPED_GAMES = [
    'nickname-generator', 'safe-clicking', 'password-strength', 'digital-memory', 'emoji-reaction',
    'data-detective', 'post-simulator', 'cyberbullying-simulator', 'digital-ally', 'inbox-inspector', 'sms-scam-sim',
    'news-editor', 'fake-headline', 'phishing-detector', 'wifi-check', 'reputation-sim'
];

// --- INDIVIDUAL GAME COMPONENTS ---

interface BaseGameProps {
    onGameComplete: (score: number, time: number) => void;
    userSkill: number;
}

// --- KID GAMES ---

const NicknameGeneratorGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const startTime = useRef(Date.now());

    const generateNickname = () => {
        const adjectives = ['Veloz', 'Súper', 'Mágico', 'Estelar', 'Ciber', 'Digital', 'Quantum'];
        const nouns = ['Lobo', 'Halcón', 'León', 'Tigre', 'Zorro', 'Dragón', 'Fénix'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNumber = Math.floor(Math.random() * 99) + 1;
        setNickname(`${randomAdj}${randomNoun}${randomNumber}`);
    };

    const handleComplete = () => {
        const time = (Date.now() - startTime.current) / 1000;
        onGameComplete(1, time);
    };

    return (
        <div className="text-center text-slate-800">
            <p className="text-slate-600 mb-4">¡Un buen apodo no usa tu nombre real! Ingresa tu nombre para ver que no lo usaremos.</p>
            <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Escribe tu primer nombre"
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md mb-4 text-slate-800"
            />
            <button onClick={generateNickname} className="block mx-auto bg-sky-500 text-white font-bold py-2 px-4 rounded-full mb-4">Generar Apodo Seguro</button>
            {nickname && (
                <div className="bg-green-100 p-4 rounded-lg">
                    <p className="font-bold text-green-800">¡Tu nuevo apodo seguro es:</p>
                    <p className="text-2xl font-extrabold text-green-700 my-2">{nickname}</p>
                    <p className="text-sm text-green-600">¿Ves? ¡No se parece a tu nombre real! Es perfecto para jugar en línea.</p>
                    <button onClick={handleComplete} className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-full">¡Entendido!</button>
                </div>
            )}
        </div>
    );
};

const SafeClickingGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
    const [feedback, setFeedback] = useState('');
    const startTime = useRef(Date.now());

    const handleClick = (isSafe: boolean) => {
        if (isSafe) {
            setFeedback('¡Correcto! Este enlace parece seguro. ¡Bien hecho!');
            setTimeout(() => {
                const time = (Date.now() - startTime.current) / 1000;
                onGameComplete(1, time);
            }, 1500);
        } else {
            setFeedback('¡Cuidado! Ese enlace podría ser peligroso. Fíjate en los nombres extraños o las promesas demasiado buenas. Intenta de nuevo.');
        }
    };

    return (
        <div className="text-center text-slate-800">
            <p className="text-slate-600 mb-6">Algunos enlaces son seguros, otros no. Haz clic en el que creas que es SEGURO.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => handleClick(false)} className="p-4 bg-slate-100 rounded-lg border-2 border-slate-300 hover:border-sky-500 text-slate-800">juegosgratis-premios.xyz</button>
                <button onClick={() => handleClick(true)} className="p-4 bg-slate-100 rounded-lg border-2 border-slate-300 hover:border-sky-500 text-slate-800">cyberkids.cl/juegos</button>
                <button onClick={() => handleClick(false)} className="p-4 bg-slate-100 rounded-lg border-2 border-slate-300 hover:border-sky-500 text-slate-800">gana-dinero-facil.biz</button>
                <button onClick={() => handleClick(false)} className="p-4 bg-slate-100 rounded-lg border-2 border-slate-300 hover:border-sky-500 text-slate-800">seguridad.net/login.php</button>
            </div>
            {feedback && <p className={`mt-4 font-bold ${feedback.startsWith('¡Correcto') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
        </div>
    );
};


const PasswordStrengthGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
    const [password, setPassword] = useState('');
    const startTime = useRef(Date.now());

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    const isStrong = strength === 3;
    
    const handleComplete = () => {
         const time = (Date.now() - startTime.current) / 1000;
        onGameComplete(1, time);
    };

    return (
        <div className="text-center text-slate-800">
            <input 
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Escribe una contraseña..."
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md mb-4 bg-white text-slate-800"
                aria-label="Campo para crear contraseña"
            />
            <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-4 mb-4">
                <div className={`h-4 rounded-full transition-all ${strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${(strength/3)*100}%`}}></div>
            </div>
            <ul className="text-left max-w-xs mx-auto space-y-1 mb-4">
                <li className={checks.length ? 'text-green-600' : 'text-slate-500'}>{checks.length ? '✅' : '❌'} Al menos 8 caracteres.</li>
                <li className={checks.uppercase ? 'text-green-600' : 'text-slate-500'}>{checks.uppercase ? '✅' : '❌'} Incluye una mayúscula (A-Z).</li>
                <li className={checks.number ? 'text-green-600' : 'text-slate-500'}>{checks.number ? '✅' : '❌'} Incluye un número (0-9).</li>
            </ul>
            {isStrong && (
                <div className="bg-green-100 p-4 rounded-lg">
                    <p className="font-bold text-green-800">¡Contraseña Fuerte! ¡Bien hecho!</p>
                    <button onClick={handleComplete} className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-full">Continuar</button>
                </div>
            )}
        </div>
    );
};

const DigitalMemoryGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
    const symbols = useMemo(() => ['🛡️', '🔑', '🔒', '🔎', '🛡️', '🔑', '🔒', '🔎'].sort(() => Math.random() - 0.5), []);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<string[]>([]);
    const startTime = useRef(Date.now());

    useEffect(() => {
        if (flipped.length === 2) {
            const [firstIndex, secondIndex] = flipped;
            if (symbols[firstIndex] === symbols[secondIndex]) {
                setMatched(prev => [...prev, symbols[firstIndex]]);
            }
            setTimeout(() => setFlipped([]), 1000);
        }
    }, [flipped, symbols]);

    useEffect(() => {
        if (matched.length === symbols.length / 2) {
            const time = (Date.now() - startTime.current) / 1000;
            setTimeout(() => onGameComplete(1, time), 500);
        }
    }, [matched, symbols, onGameComplete]);

    const handleCardClick = (index: number) => {
        if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(symbols[index])) {
            setFlipped(prev => [...prev, index]);
        }
    };

    return (
        <div className="text-center text-slate-800">
            <p className="text-slate-600 mb-4">Encuentra los pares de símbolos de seguridad. ¡Usa tu memoria!</p>
            <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
                {symbols.map((symbol, index) => (
                    <button
                        key={index}
                        onClick={() => handleCardClick(index)}
                        className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl transition-transform duration-300 ${flipped.includes(index) || matched.includes(symbol) ? 'bg-sky-200 rotate-y-180' : 'bg-sky-500'}`}
                    >
                        {flipped.includes(index) || matched.includes(symbol) ? symbol : '?'}
                    </button>
                ))}
            </div>
        </div>
    );
};

const EmojiReactionGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
    const [feedback, setFeedback] = useState('');
    const startTime = useRef(Date.now());

    const handleReaction = (isCorrect: boolean) => {
        if (isCorrect) {
            setFeedback('¡Exacto! Esa es una reacción amable y de apoyo. ¡Muy bien!');
            setTimeout(() => {
                const time = (Date.now() - startTime.current) / 1000;
                onGameComplete(1, time);
            }, 1500);
        } else {
            setFeedback('Esa reacción podría herir los sentimientos de tu amigo. Intenta con una más amable.');
        }
    };

    return (
        <div className="text-center text-slate-800">
            <p className="text-slate-600 mb-4">Un amigo publica: "¡Estoy muy feliz, gané el partido de fútbol!"</p>
            <p className="mb-6">¿Cómo reaccionas?</p>
            <div className="flex justify-center gap-4 text-4xl">
                <button onClick={() => handleReaction(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">😠</button>
                <button onClick={() => handleReaction(true)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">🎉</button>
                <button onClick={() => handleReaction(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">😢</button>
                <button onClick={() => handleReaction(true)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">👍</button>
            </div>
            {feedback && <p className={`mt-4 font-bold ${feedback.startsWith('¡Exacto') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
        </div>
    );
};


const PhishingDetectorGame: React.FC<BaseGameProps> = ({ onGameComplete, userSkill }) => {
    const emails = useMemo(() => [
        { id: 1, sender: 'Banco Chile', subject: 'Verifica tu cuenta AHORA', suspicious: true },
        { id: 2, sender: 'Ana (Mamá)', subject: '¿Puedes comprar pan?', suspicious: false },
        { id: 3, sender: 'Ganaste un PREMIO!', subject: 'Haz clic para reclamar tu iPhone', suspicious: true },
        { id: 4, sender: 'Netflix', subject: 'Actualización de tu suscripción', suspicious: false },
    ], []);

    const [selected, setSelected] = useState<number[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const startTime = useRef(Date.now());

    const handleSelect = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        const correctSelections = emails.filter(e => e.suspicious).map(e => e.id);
        const userCorrect = selected.filter(id => correctSelections.includes(id)).length;
        const userIncorrect = selected.filter(id => !correctSelections.includes(id)).length;
        
        const score = Math.max(0, (userCorrect - userIncorrect) / correctSelections.length);
        const time = (Date.now() - startTime.current) / 1000;
        onGameComplete(score, time);
    };

    if (isSubmitted) {
        return <div className="text-center font-bold text-green-600">¡Revisión completada! Aprendiste a identificar correos sospechosos.</div>;
    }

    return (
        <div className="text-slate-800">
            <p className="text-slate-600 mb-4 text-center">Revisa tu bandeja de entrada. Selecciona los correos que te parezcan FALSOS o sospechosos y luego presiona Comprobar.</p>
            <div className="space-y-2">
                {emails.map(email => (
                    <div
                        key={email.id}
                        onClick={() => handleSelect(email.id)}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${selected.includes(email.id) ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}
                    >
                        <input type="checkbox" readOnly checked={selected.includes(email.id)} className="mr-3 h-5 w-5" />
                        <div>
                            <p className="font-bold text-slate-700">{email.sender}</p>
                            <p className="text-sm text-slate-500">{email.subject}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleSubmit} className="w-full mt-4 bg-sky-500 text-white font-bold py-2 rounded-full">Comprobar</button>
        </div>
    );
};


const GameLesson: React.FC<GameLessonProps> = ({ lesson, onComplete }) => {
    const context = useContext(AppContext) as AppContextType;
    if (!context || !context.user) return null;

    const { completeLesson, user } = context;
    const gameContent = lesson.content as GameContent;

    const [isGameFinished, setIsGameFinished] = useState(false);
    const [gameResult, setGameResult] = useState<{score: number, time: number} | null>(null);

    const handleGameComplete = (score: number, time: number) => {
        setGameResult({score, time});
        setIsGameFinished(true);
    };

    const handleClaimXP = () => {
        if (gameResult) {
            completeLesson(lesson, gameResult);
        }
        onComplete();
    };
    
    const userSkill = useMemo(() => {
        if (!user) return 0.3;
        const performances = Object.values(user.performance);
        if (performances.length === 0) return 0.3;
        // FIX: Correctly typed `user.performance` in `types.ts` to ensure `p` is inferred as `Performance`.
        const totalScore = performances.reduce((acc, p) => acc + p.score, 0);
        return totalScore / performances.length;
    }, [user]);

    const renderGame = () => {
        // A simple placeholder for games that are just text-based choices
        const SimpleChoiceGame = ({ onGameComplete, choices, correctIndex, premise }: { onGameComplete: BaseGameProps['onGameComplete'], choices: string[], correctIndex: number, premise: string }) => {
            const [feedback, setFeedback] = useState('');
            const startTime = useRef(Date.now());
            const handleClick = (index: number) => {
                if (index === correctIndex) {
                    setFeedback('¡Correcto! Muy bien pensado.');
                    setTimeout(() => onGameComplete(1, (Date.now() - startTime.current)/1000), 1500);
                } else {
                    setFeedback('Esa no es la mejor opción. Inténtalo de nuevo.');
                }
            };
            return (
                <div className="text-center text-slate-800">
                    <p className="text-slate-600 mb-6">{premise}</p>
                    <div className="space-y-3">
                        {choices.map((choice, index) => (
                            <button key={index} onClick={() => handleClick(index)} className="w-full p-3 bg-slate-100 rounded-lg border-2 border-slate-300 hover:border-sky-500 text-slate-800">{choice}</button>
                        ))}
                    </div>
                    {feedback && <p className={`mt-4 font-bold ${feedback.startsWith('¡Correcto') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
                </div>
            );
        };
        
        switch (gameContent.type) {
            case 'nickname-generator':
                return <NicknameGeneratorGame onGameComplete={handleGameComplete} userSkill={userSkill} />;
            case 'safe-clicking':
                return <SafeClickingGame onGameComplete={handleGameComplete} userSkill={userSkill} />;
            case 'password-strength':
                return <PasswordStrengthGame onGameComplete={handleGameComplete} userSkill={userSkill} />;
            case 'digital-memory':
                return <DigitalMemoryGame onGameComplete={handleGameComplete} userSkill={userSkill} />;
            case 'emoji-reaction':
                return <EmojiReactionGame onGameComplete={handleGameComplete} userSkill={userSkill} />;
            case 'phishing-detector':
            case 'inbox-inspector':
                return <PhishingDetectorGame onGameComplete={handleGameComplete} userSkill={userSkill} />;
            
            // Cases for simpler choice-based games
            case 'data-detective':
                return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="Un perfil público muestra un número de teléfono. ¿Es seguro?" choices={["Sí, es útil", "No, es información privada"]} correctIndex={1} />;
            case 'post-simulator':
                return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="Vas a publicar una foto de tus vacaciones. ¿Qué caption es más seguro?" choices={["¡En la playa de Reñaca!", "¡Día de playa!", "Ojalá estuviera en la playa"]} correctIndex={1} />;
            case 'cyberbullying-simulator':
            case 'digital-ally':
                 return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="Ves un comentario cruel hacia un compañero. ¿Qué haces?" choices={["Lo ignoro", "Le doy 'me gusta' al comentario cruel", "Reporto el comentario y apoyo a mi compañero"]} correctIndex={2} />;
            case 'sms-scam-sim':
                return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="Recibes un SMS: 'Tu paquete tiene un problema. Haz clic aquí para solucionarlo: url-corta.ly'. ¿Qué haces?" choices={["Hago clic para ver qué pasa", "Lo ignoro y borro el mensaje", "Le respondo al número"]} correctIndex={1} />;
            case 'news-editor':
            case 'fake-headline':
                return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="¿Cuál titular es más probable que sea 'clickbait' o noticia falsa?" choices={["Nuevo parque abre en la ciudad", "¡INCREÍBLE! ¡CIENTÍFICOS DESCUBREN ALGO QUE NO CREERÁS!", "El tráfico aumenta un 5% este mes"]} correctIndex={1} />;
            case 'wifi-check':
                return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="En un café, ¿a qué red Wi-Fi te conectarías?" choices={["Wi-Fi GRATIS", "Cafeteria_Clientes (con contraseña)", "Hotspot_iPhone_de_Juan"]} correctIndex={1} />;
            case 'reputation-sim':
                return <SimpleChoiceGame onGameComplete={handleGameComplete} premise="Tu amigo te etiqueta en una foto vergonzosa. ¿Qué es lo mejor para tu reputación a largo plazo?" choices={["Me enojo y comento algo peor en su perfil", "Le pido amablemente por privado que la quite", "No hago nada"]} correctIndex={1} />;

            default:
                return (
                    <div className="text-center bg-slate-100 p-6 rounded-lg text-slate-800">
                        <p className="text-slate-700 mb-4">{gameContent.description}</p>
                        <button 
                            onClick={() => handleGameComplete(1, 10)}
                            className="bg-sky-500 text-white font-bold py-2 px-6 rounded-full"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-2">{lesson.title}</h3>
            <p className="text-center text-slate-500 mb-6">{gameContent.description}</p>
            
            <div className="bg-white p-6 rounded-lg shadow-inner">
                {renderGame()}
            </div>

            {isGameFinished && (
                <div className="mt-6 flex flex-col items-center text-center">
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                        <h4 className="font-bold">¡Desafío Superado!</h4>
                        <p className="text-sm">¡Has aprendido una nueva habilidad! Reclama tu recompensa.</p>
                    </div>
                    <button
                        onClick={handleClaimXP}
                        className="mt-4 w-full md:w-auto bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-colors"
                    >
                        Reclamar {lesson.xp} XP
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameLesson;
