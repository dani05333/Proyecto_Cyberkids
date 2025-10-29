
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';
import { XMarkIcon, SparklesIcon, RocketLaunchIcon, CheckCircleIcon } from './icons';

interface PremiumModalProps {
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose }) => {
  const context = useContext(AppContext) as AppContextType;
  
  if (!context) return null;

  const { upgradeToPremium, closePremiumModal } = context;

  const handleUpgrade = () => {
    upgradeToPremium();
    closePremiumModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all">
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-500" />
            <span>CyberKids Premium</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
            <XMarkIcon className="w-6 h-6 text-slate-600" />
          </button>
        </header>
        <main className="p-6">
          <div className="text-center mb-6">
            <RocketLaunchIcon className="w-20 h-20 text-sky-500 mx-auto" />
            <h3 className="text-3xl font-extrabold text-slate-800 mt-4">¡Desbloquea Todo tu Potencial!</h3>
            <p className="text-slate-600 mt-2">Conviértete en un Guardián Cibernético experto con acceso ilimitado.</p>
          </div>
          
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-center gap-3">
              <span className="bg-green-100 rounded-full p-1"><CheckCircleIcon className="h-5 w-5 text-green-600" /></span>
              <span>Acceso a <strong>todas las lecciones y módulos</strong>.</span>
            </li>
            <li className="flex items-center gap-3">
               <span className="bg-green-100 rounded-full p-1"><CheckCircleIcon className="h-5 w-5 text-green-600" /></span>
              <span><strong>Accesorios exclusivos</strong> para tu avatar (¡como la corona 👑!).</span>
            </li>
            <li className="flex items-center gap-3">
               <span className="bg-green-100 rounded-full p-1"><CheckCircleIcon className="h-5 w-5 text-green-600" /></span>
              <span><strong>Misiones y desafíos especiales</strong> cada semana.</span>
            </li>
          </ul>

        </main>
        <footer className="p-6 bg-slate-50 rounded-b-2xl">
           <button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
                ¡Hazte Premium Ahora!
            </button>
            <button
                type="button"
                onClick={onClose}
                className="w-full text-center mt-3 text-sm text-slate-500 hover:text-slate-700 font-semibold"
            >
                Quizás más tarde
            </button>
        </footer>
      </div>
    </div>
  );
};

export default PremiumModal;
