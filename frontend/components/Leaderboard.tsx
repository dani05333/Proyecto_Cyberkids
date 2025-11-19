import React, { useState, useEffect, useContext } from "react";
import { User, AppContextType, AgeGroup } from "../types";
import { AppContext } from "../App";
import AvatarDisplay from "./AvatarDisplay";
import { TrophyIcon } from "./icons";

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const context = useContext(AppContext) as AppContextType;
  const currentUser = context?.user;

  useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/leaderboard/");
      const data = await res.json();

      // Convertir backend → User
      const converted: User[] = data.map((u: any) => ({
        name: u.username,
        role: "student",
        ageGroup: u.age_group,
        xp: u.xp,

        avatarCustomization: {
          face: "🧑‍🚀",
          headwear: "none",
          eyewear: "none",
          clothing: "tshirt",
          backgroundColor: "bg-sky-200",
        },

        completedLessons: new Set(),
        performance: {},
        badges: [],
        weeklyMissionProgress: {},
        gameState: {},
        isPremium: false,
      }));

      // ordenar
      setTopUsers(converted.slice(0, 5));
    } catch (err) {
      console.error("Error leaderboard:", err);
    }
  };

  fetchLeaderboard();
}, []);


  if (!currentUser || topUsers.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-12">
      <h3 className="text-2xl font-extrabold text-slate-800 text-center mb-4">
        🏆 Top Guardianes
      </h3>

      <ul className="space-y-3">
        {topUsers.map((user, index) => {
          const isCurrentUser = user.name === currentUser.name;

          return (
            <li
              key={`${user.name}-${index}`}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-sky-100 border-2 border-sky-300"
                  : "bg-slate-50"
              }`}
            >
              <div className="w-8 mr-3 flex items-center justify-center">
                {index === 0 ? (
                  <TrophyIcon className="w-6 h-6 text-amber-400" />
                ) : (
                  <span className="font-bold text-slate-600 text-lg">
                    {index + 1}
                  </span>
                )}
              </div>

              <AvatarDisplay user={user} size="sm" />

              <span className="ml-4 font-bold text-slate-700 flex-grow">
                {user.name}
              </span>

              <span className="font-bold text-amber-600">{user.xp} XP</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Leaderboard;
