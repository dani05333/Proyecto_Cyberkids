import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';
import { BADGES } from '../constants';
import AvatarDisplay from './AvatarDisplay';
import AvatarCustomizer from './AvatarCustomizer';
import { RocketLaunchIcon } from './icons';

const UserProfileSidebar: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const [isCustomizing, setIsCustomizing] = useState(false);

  if (!context || !context.user) {
    return null;
  }

  const { user, logout, openPremiumModal } = context;

  const totalLessonsInGame = 11; // Hardcoded for now, should be dynamic
  const progress = Math.round((user.completedLessons.size / totalLessonsInGame) * 100);

  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">CyberKids Chile</h1>
      <div className="relative mb-4">
        <AvatarDisplay user={user} size="xl" />
        <button 
          onClick={() => setIsCustomizing(true)}
          className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-slate-100"
          aria-label="Personalizar avatar"
        >
          🎨
        </button>
      </div>

      <h2 className="text-xl font-bold text-slate-700">{user.name}</h2>
      <p className="text-slate-500 text-sm mb-4">{user.ageGroup}</p>

      <div className="w-full bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-full text-lg mb-6">
        {user.xp} XP
      </div>
      
      {!user.isPremium && (
          <button onClick={openPremiumModal} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-full mb-6 flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105">
            <RocketLaunchIcon className="w-5 h-5" />
            ¡Hazte Premium!
          </button>
      )}


      <div className="w-full text-left mb-6">
        <h3 className="font-bold text-slate-700 mb-2">Progreso Total</h3>
        <div className="w-full bg-slate-200 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{width: `${progress}%`}}>
                {progress}%
            </div>
        </div>
      </div>

      <div className="w-full text-left mb-6">
          <h3 className="font-bold text-slate-700 mb-2">Insignias</h3>
          {user.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {user.badges.map(badgeKey => {
                    const badge = BADGES[badgeKey];
                    return <div key={badgeKey} title={`${badge.name}: ${badge.description}`} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">{badge.emoji}</div>
                })}
            </div>
          ) : <p className="text-slate-500 text-sm">¡Sigue aprendiendo para ganar insignias!</p>}
      </div>

      <div className="mt-auto w-full">
        <button
          onClick={logout}
          className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
      {isCustomizing && <AvatarCustomizer onClose={() => setIsCustomizing(false)} />}
    </aside>
  );
};

export default UserProfileSidebar;