import React, { useState, useEffect, useContext } from 'react';
import { User, AppContextType } from '../types';
import { AppContext } from '../App';
import AvatarDisplay from './AvatarDisplay';
import { TrophyIcon } from './icons';

// FIX: Corrected the MOCK_USERS_DATA to align with the User and AvatarCustomization types.
// Replaced the 'avatar' and 'accessory' properties with the correct 'face', 'headwear', and 'eyewear' properties within 'avatarCustomization'.
const MOCK_USERS_DATA: Omit<User, 'ageGroup'>[] = [
  { name: 'Capitán Ciber', xp: 1500, avatarCustomization: { face: '🧑‍✈️', headwear: 'none', eyewear: 'none', clothing: 'suit', backgroundColor: 'bg-indigo-200' }, completedLessons: new Set(['kid-l1-1', 'kid-l1-2', 'kid-l2-1']), performance: {}, badges: ['first_step'], weeklyMissionProgress: {}, gameState: {} },
  { name: 'Agente Secreta', xp: 1250, avatarCustomization: { face: '🕵️‍♀️', headwear: 'none', eyewear: 'glasses', clothing: 'jacket', backgroundColor: 'bg-slate-200' }, completedLessons: new Set(['kid-l1-1', 'kid-l1-2']), performance: {}, badges: [], weeklyMissionProgress: {}, gameState: {} },
  { name: 'Maestra del Código', xp: 980, avatarCustomization: { face: '👩‍💻', headwear: 'headphones', eyewear: 'none', clothing: 'tshirt', backgroundColor: 'bg-rose-200' }, completedLessons: new Set(['tween-l1-1']), performance: {}, badges: ['first_step'], weeklyMissionProgress: {}, gameState: {} },
  { name: 'Hacker Ético Jr.', xp: 720, avatarCustomization: { face: '👨‍🎓', headwear: 'hat', eyewear: 'none', clothing: 'none', backgroundColor: 'bg-green-200' }, completedLessons: new Set(), performance: {}, badges: [], weeklyMissionProgress: {}, gameState: {} },
  { name: 'Exploradora Digital', xp: 450, avatarCustomization: { face: '🧭', headwear: 'none', eyewear: 'none', clothing: 'none', backgroundColor: 'bg-amber-200' }, completedLessons: new Set(['kid-l1-1']), performance: {}, badges: ['first_step'], weeklyMissionProgress: {}, gameState: {} }
];

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const context = useContext(AppContext) as AppContextType;
  const currentUser = context?.user;

  useEffect(() => {
    if (!currentUser) return;

    // Simulate a global user list by combining mock users with the current user
    const allUsers: User[] = [
      ...MOCK_USERS_DATA.map(u => ({ ...u, ageGroup: currentUser.ageGroup })),
      currentUser
    ];

    // Sort by XP descending and take the top 5
    const sortedUsers = allUsers
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);
      
    setTopUsers(sortedUsers);
  }, [currentUser]);

  if (!currentUser || topUsers.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-12">
      <h3 className="text-2xl font-extrabold text-slate-800 text-center mb-4">🏆 Top Guardianes</h3>
      <ul className="space-y-3">
        {topUsers.map((user, index) => {
          const isCurrentUser = user.name === currentUser.name && user.xp === currentUser.xp;
          return (
            <li key={`${user.name}-${index}`} className={`flex items-center p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-sky-100 border-2 border-sky-300' : 'bg-slate-50'}`}>
              <div className="w-8 text-center mr-3 flex items-center justify-center">
                {index === 0 ? <TrophyIcon className="w-6 h-6 text-amber-400" /> : <span className="font-bold text-slate-600 text-lg">{index + 1}</span>}
              </div>
              <AvatarDisplay user={user} size="sm" />
              <span className="ml-4 font-bold text-slate-700 flex-grow">{user.name}</span>
              <span className="font-bold text-amber-600">{user.xp} XP</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Leaderboard;
