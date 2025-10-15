import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import AvatarDisplay from './AvatarDisplay';
import AvatarCustomizer from './AvatarCustomizer';
import { BADGES } from '../constants';
import { AppContextType } from '../types';

const WeeklyMissionCard: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  if (!context || !context.user || !context.weeklyMission) return null;

  const { user, weeklyMission } = context;
  const progress = user.weeklyMissionProgress[weeklyMission.id] || 0;
  const goal = weeklyMission.goal.count;
  const isCompleted = user.badges.includes(weeklyMission.rewardBadge);
  const progressPercentage = (progress / goal) * 100;

  const rewardBadge = BADGES[weeklyMission.rewardBadge];

  return (
    <div className="w-full bg-white p-4 rounded-lg border border-slate-200 mt-6">
        <h3 className="font-bold text-slate-800 text-lg">Misión Semanal</h3>
        <p className="text-sm text-slate-500 mt-1">{weeklyMission.title}</p>
        <p className="text-xs text-slate-500 mt-2">{weeklyMission.description}</p>
        
        {isCompleted ? (
            <div className="mt-4 text-center bg-green-100 p-3 rounded-lg">
                <p className="font-bold text-green-700">¡Misión Completada!</p>
                <p className="text-sm text-green-600">Ganaste la insignia "{rewardBadge.name}" {rewardBadge.emoji}</p>
            </div>
        ) : (
            <div className="mt-4">
                <div className="flex justify-between items-center text-sm font-bold text-slate-600 mb-1">
                    <span>Progreso</span>
                    <span>{progress} / {goal}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        )}
    </div>
  );
};

const BadgeDisplay: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    if (!context || !context.user || context.user.badges.length === 0) return null;

    const { user } = context;

    return (
        <div className="w-full bg-white p-4 rounded-lg border border-slate-200 mt-6">
            <h3 className="font-bold text-slate-800 text-lg mb-3">Mis Insignias</h3>
            <div className="flex flex-wrap gap-3">
                {user.badges.map(badgeKey => {
                    const badge = BADGES[badgeKey];
                    if (!badge) return null;
                    return (
                        <div key={badgeKey} className="group relative" title={badge.name}>
                             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl cursor-pointer">
                                {badge.emoji}
                            </div>
                            <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {badge.name}: {badge.description}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const UserProfileSidebar: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  if (!context || !context.user) {
    return (
      <aside className="w-full md:w-80 bg-slate-100 p-6 flex flex-col items-center animate-pulse">
        <div className="w-24 h-24 bg-slate-300 rounded-full mb-4"></div>
        <div className="h-6 w-32 bg-slate-300 rounded mb-4"></div>
        <div className="h-10 w-24 bg-slate-300 rounded-full"></div>
      </aside>
    );
  }
  
  const { user } = context;

  return (
    <>
      <aside className="w-full md:w-80 bg-slate-100 p-6 flex flex-col items-center border-r border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 self-start">Mi Perfil</h2>
        <div className="relative mb-4">
          <AvatarDisplay user={user} size="lg" />
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-2 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-110"
            aria-label="Personalizar avatar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <h3 className="text-xl font-bold text-slate-700">{user.name}</h3>
        <p className="text-sm text-slate-500">{user.ageGroup}</p>
        <div className="mt-4 bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-full text-lg">
          {user.xp} XP
        </div>
        <WeeklyMissionCard />
        <BadgeDisplay />
      </aside>
      {isCustomizerOpen && <AvatarCustomizer onClose={() => setIsCustomizerOpen(false)} />}
    </>
  );
};

export default UserProfileSidebar;
