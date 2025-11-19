import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { AppContext } from '../App';
import { Lesson, AppContextType, GameContent, Performance } from '../types';

interface GameLessonProps {
  lesson: Lesson;
  onComplete: () => void;
}

/* -------------------------------------------------------------------------- */
/*                                Helper Types                                */
/* -------------------------------------------------------------------------- */

interface BaseGameProps {
  onGameComplete: (score: number, time: number) => void;
  userSkill: number;
}

/* -------------------------------------------------------------------------- */
/*                            Game Components (Kids)                          */
/* -------------------------------------------------------------------------- */

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
      <p className="text-slate-600 mb-4">
        ¡Un buen apodo no usa tu nombre real! Ingresa tu nombre para ver que no lo usaremos.
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Escribe tu primer nombre"
        className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md mb-4 text-slate-800"
      />

      <button
        onClick={generateNickname}
        className="block mx-auto bg-sky-500 text-white font-bold py-2 px-4 rounded-full mb-4"
      >
        Generar Apodo Seguro
      </button>

      {nickname && (
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="font-bold text-green-800">¡Tu nuevo apodo seguro es:</p>
          <p className="text-2xl font-extrabold text-green-700 my-2">{nickname}</p>
          <p className="text-sm text-green-600">
            ¿Ves? ¡No se parece a tu nombre real! Es perfecto para jugar en línea.
          </p>

          <button
            onClick={handleComplete}
            className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-full"
          >
            ¡Entendido!
          </button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------- Safe Click ------------------------------ */

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
      setFeedback('¡Cuidado! Ese enlace podría ser peligroso.');
    }
  };

  return (
    <div className="text-center text-slate-800">
      <p className="text-slate-600 mb-6">Haz clic en el enlace SEGURO.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => handleClick(false)} className="p-4 bg-slate-100 border">
          juegosgratis-premios.xyz
        </button>
        <button onClick={() => handleClick(true)} className="p-4 bg-slate-100 border">
          cyberkids.cl/juegos
        </button>
        <button onClick={() => handleClick(false)} className="p-4 bg-slate-100 border">
          gana-dinero-facil.biz
        </button>
        <button onClick={() => handleClick(false)} className="p-4 bg-slate-100 border">
          seguridad.net/login.php
        </button>
      </div>

      {feedback && (
        <p
          className={`mt-4 font-bold ${
            feedback.startsWith('¡Correcto') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
};

/* --------------------------- Password Strength --------------------------- */

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
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Escribe una contraseña..."
        className="w-full max-w-xs px-3 py-2 border mb-4 bg-white text-slate-800"
      />

      <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-4 mb-4">
        <div
          className={`h-4 rounded-full ${
            strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${(strength / 3) * 100}%` }}
        ></div>
      </div>

      {isStrong && (
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="font-bold text-green-800">¡Contraseña Fuerte!</p>
          <button
            onClick={handleComplete}
            className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-full"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Memory Game                               */
/* -------------------------------------------------------------------------- */

const DigitalMemoryGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
  const symbols = useMemo(
    () => ['🛡️', '🔑', '🔒', '🔎', '🛡️', '🔑', '🔒', '🔎'].sort(() => Math.random() - 0.5),
    []
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (flipped.length === 2) {
      const [i1, i2] = flipped;
      if (symbols[i1] === symbols[i2]) {
        setMatched((prev) => [...prev, symbols[i1]]);
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, symbols]);

  useEffect(() => {
    if (matched.length === symbols.length / 2) {
      const time = (Date.now() - startTime.current) / 1000;
      setTimeout(() => onGameComplete(1, time), 500);
    }
  }, [matched, symbols, onGameComplete]);

  return (
    <div className="text-center text-slate-800">
      <p className="text-slate-600 mb-4">Encuentra los pares de símbolos. ¡Usa tu memoria!</p>

      <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
        {symbols.map((symbol, index) => (
          <button
            key={index}
            onClick={() => {
              if (!flipped.includes(index) && !matched.includes(symbol)) {
                setFlipped((prev) => [...prev, index]);
              }
            }}
            className="w-16 h-16 rounded-lg bg-sky-500 flex items-center justify-center text-3xl"
          >
            {flipped.includes(index) || matched.includes(symbol) ? symbol : '?'}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------ Emoji Reaction ---------------------------- */

const EmojiReactionGame: React.FC<BaseGameProps> = ({ onGameComplete }) => {
  const [feedback, setFeedback] = useState('');
  const startTime = useRef(Date.now());

  const handleReaction = (ok: boolean) => {
    if (ok) {
      setFeedback('¡Exacto! Esa es una reacción amable.');
      setTimeout(() => {
        const time = (Date.now() - startTime.current) / 1000;
        onGameComplete(1, time);
      }, 1500);
    } else {
      setFeedback('Esa reacción podría herir sentimientos.');
    }
  };

  return (
    <div className="text-center text-slate-800">
      <p className="text-slate-600 mb-6">
        Un amigo publica: "¡Estoy muy feliz, gané el partido!"
      </p>

      <div className="flex justify-center gap-4 text-4xl">
        <button onClick={() => handleReaction(false)}>😠</button>
        <button onClick={() => handleReaction(true)}>🎉</button>
        <button onClick={() => handleReaction(false)}>😢</button>
        <button onClick={() => handleReaction(true)}>👍</button>
      </div>

      {feedback && (
        <p
          className={`mt-4 font-bold ${
            feedback.startsWith('¡Exacto') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
};

/* -------------------------- Phishing Detector ----------------------------- */

const PhishingDetectorGame: React.FC<BaseGameProps> = ({
  onGameComplete,
  userSkill,
}) => {
  const emails = useMemo(
    () => [
      { id: 1, sender: 'Banco Chile', subject: 'Verifica tu cuenta AHORA', suspicious: true },
      { id: 2, sender: 'Ana (Mamá)', subject: '¿Puedes comprar pan?', suspicious: false },
      { id: 3, sender: 'Ganaste un PREMIO!', subject: 'Haz clic para reclamar tu iPhone', suspicious: true },
      { id: 4, sender: 'Netflix', subject: 'Actualización de suscripción', suspicious: false },
    ],
    []
  );

  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const startTime = useRef(Date.now());

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const correct = emails.filter((e) => e.suspicious).map((e) => e.id);
    const correctHits = selected.filter((id) => correct.includes(id)).length;
    const wrongHits = selected.filter((id) => !correct.includes(id)).length;

    const score = Math.max(0, (correctHits - wrongHits) / correct.length);
    const time = (Date.now() - startTime.current) / 1000;

    onGameComplete(score, time);
  };

  if (submitted) {
    return <div className="text-center text-green-600 font-bold">¡Muy bien! Aprendiste a detectar correos sospechosos.</div>;
  }

  return (
    <div>
      <p className="text-center text-slate-600 mb-4">
        Selecciona los correos sospechosos:
      </p>

      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => handleSelect(email.id)}
            className={`p-3 border-2 rounded-lg cursor-pointer ${
              selected.includes(email.id) ? 'border-sky-500 bg-sky-50' : 'border-slate-200'
            }`}
          >
            <p className="font-bold">{email.sender}</p>
            <p className="text-sm">{email.subject}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-4 bg-sky-500 text-white py-2 rounded-full font-bold"
      >
        Comprobar
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const GameLesson: React.FC<GameLessonProps> = ({ lesson, onComplete }) => {
  const context = useContext(AppContext) as AppContextType;
  if (!context || !context.user) return null;

  const { completeLesson, user } = context;
  const gameContent = lesson.content as GameContent;

  const [result, setResult] = useState<{ score: number; time: number } | null>(null);

  const handleFinish = (score: number, time: number) => {
    setResult({ score, time });
  };

  const claimXP = () => {
    if (result) {
      completeLesson(lesson, result);
    }
    onComplete();
  };

  const userSkill = useMemo(() => {
    const values = Object.values(user.performance);
    if (values.length === 0) return 0.3;

    const total = values.reduce((acc, p) => acc + p.score, 0);
    return total / values.length;
  }, [user]);

  /* --------------------------- Render Game Switch -------------------------- */

  const renderGame = () => {
    const SimpleChoiceGame = ({
      onGameComplete,
      premise,
      choices,
      correctIndex,
    }: {
      onGameComplete: (score: number, time: number) => void;
      premise: string;
      choices: string[];
      correctIndex: number;
    }) => {
      const [feedback, setFeedback] = useState('');
      const startTime = useRef(Date.now());

      const pick = (i: number) => {
        if (i === correctIndex) {
          setFeedback('¡Correcto!');
          setTimeout(() => {
            const time = (Date.now() - startTime.current) / 1000;
            onGameComplete(1, time);
          }, 1000);
        } else {
          setFeedback('No es la mejor opción.');
        }
      };

      return (
        <div className="text-center text-slate-800">
          <p className="mb-4">{premise}</p>

          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className="w-full p-3 bg-slate-100 rounded-lg border mb-2 hover:border-sky-500"
            >
              {c}
            </button>
          ))}

          {feedback && (
            <p
              className={`mt-4 font-bold ${
                feedback.startsWith('¡Correcto') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {feedback}
            </p>
          )}
        </div>
      );
    };

    switch (gameContent.type) {
      case 'nickname-generator':
        return <NicknameGeneratorGame onGameComplete={handleFinish} userSkill={userSkill} />;

      case 'safe-clicking':
        return <SafeClickingGame onGameComplete={handleFinish} userSkill={userSkill} />;

      case 'password-strength':
        return <PasswordStrengthGame onGameComplete={handleFinish} userSkill={userSkill} />;

      case 'digital-memory':
        return <DigitalMemoryGame onGameComplete={handleFinish} userSkill={userSkill} />;

      case 'emoji-reaction':
        return <EmojiReactionGame onGameComplete={handleFinish} userSkill={userSkill} />;

      case 'phishing-detector':
      case 'inbox-inspector':
        return <PhishingDetectorGame onGameComplete={handleFinish} userSkill={userSkill} />;

      /* ------------------------ juegos simples ------------------------ */

      case 'data-detective':
        return (
          <SimpleChoiceGame
            onGameComplete={handleFinish}
            premise="Un perfil muestra un número de teléfono. ¿Es seguro?"
            choices={['Sí', 'No, información privada']}
            correctIndex={1}
          />
        );

      case 'post-simulator':
        return (
          <SimpleChoiceGame
            onGameComplete={handleFinish}
            premise="¿Qué caption es más seguro?"
            choices={['En la playa de Reñaca', '¡Día de playa!', 'Ojalá estuviera en la playa']}
            correctIndex={1}
          />
        );

      default:
        return (
          <div className="text-center bg-slate-100 p-6 rounded-lg">
            <p className="mb-4">{gameContent.description}</p>
            <button
              onClick={() => handleFinish(1, 10)}
              className="bg-sky-500 text-white py-2 px-6 rounded-full"
            >
              ¡Entendido!
            </button>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-slate-800 text-center mb-2">
        {lesson.title}
      </h3>
      <p className="text-center text-slate-500 mb-6">{gameContent.description}</p>

      <div className="bg-white p-6 rounded-lg shadow-inner">{renderGame()}</div>

      {result && (
        <div className="mt-6 text-center">
          <div className="bg-green-100 p-4 rounded-lg mb-4">
            <h4 className="font-bold text-green-800">¡Desafío completado!</h4>
            <p className="text-sm">Reclama tu recompensa.</p>
          </div>

          <button
            onClick={claimXP}
            className="bg-green-500 text-white py-3 px-8 rounded-full font-bold hover:bg-green-600"
          >
            Reclamar {lesson.xp} XP
          </button>
        </div>
      )}
    </div>
  );
};

export default GameLesson;
