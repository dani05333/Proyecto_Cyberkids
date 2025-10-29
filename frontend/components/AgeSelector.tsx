import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AgeGroup, AppContextType } from '../types';

const AgeGroupCard: React.FC<{ ageGroup: AgeGroup; onSelect: () => void }> = ({ ageGroup, onSelect }) => {
  const colors: { [key in AgeGroup]: string } = {
    [AgeGroup.KID]: 'from-sky-400 to-blue-500',
    [AgeGroup.TWEEN]: 'from-amber-400 to-orange-500',
    [AgeGroup.TEEN]: 'from-emerald-400 to-green-500',
  };

  const emojis: { [key in AgeGroup]: string } = {
    [AgeGroup.KID]: '😄',
    [AgeGroup.TWEEN]: '😎',
    [AgeGroup.TEEN]: '🤓',
  };

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full md:w-64 h-80 rounded-2xl bg-gradient-to-br ${colors[ageGroup]} text-white shadow-lg transform hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-center items-center p-6 text-center`}
    >
      <div className="text-7xl mb-4 transition-transform duration-300 group-hover:scale-110">{emojis[ageGroup]}</div>
      <h3 className="text-3xl font-extrabold">{ageGroup}</h3>
      <p className="font-semibold mt-2">¡Aprende a tu ritmo!</p>
       <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
    </button>
  );
};

const AgeSelector: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">
          Bienvenid@ a <span className="text-sky-500">CyberKids Chile</span>
        </h1>
        <p className="text-slate-600 text-lg mt-4 max-w-2xl">
          Elige tu rango de edad para comenzar tu aventura en el mundo de la seguridad digital.
        </p>
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        {/* FIX: This component is part of a deprecated flow. Changed onSelect to call logout to redirect to the correct registration flow. */}
        <AgeGroupCard ageGroup={AgeGroup.KID} onSelect={() => context?.logout()} />
        <AgeGroupCard ageGroup={AgeGroup.TWEEN} onSelect={() => context?.logout()} />
        <AgeGroupCard ageGroup={AgeGroup.TEEN} onSelect={() => context?.logout()} />
      </div>
      <div className="mt-12 text-center">
        <button
            onClick={context?.logout}
            className="text-slate-500 hover:text-slate-700 font-semibold"
        >
            &larr; Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default AgeSelector;