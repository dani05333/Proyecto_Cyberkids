import React, { useState, createContext, useMemo, useCallback, useEffect } from 'react';
import { AgeGroup, User, LearningPath, LoggedInAccount, AppContextType, Lesson, PerformanceData, AvatarCustomization, WeeklyMission, LessonType, Module } from './types';
import { LEARNING_PATHS, AVATAR_OPTIONS, CURRENT_WEEKLY_MISSION } from './constants';
import Login from './components/Login';
import AgeSelector from './components/AgeSelector';
import Dashboard from './components/Dashboard';
import UserProfileSidebar from './components/UserProfileSidebar';
import LessonModal from './components/LessonModal';
import ParentDashboard from './components/ParentDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import Header from './components/Header';
import FeedbackButton from './components/FeedbackButton';

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [loggedInAccount, setLoggedInAccount] = useState<LoggedInAccount | null>(() => {
    const saved = localStorage.getItem('loggedInAccount');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cyberkids_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return {
        ...parsed,
        completedLessons: new Set(parsed.completedLessons || []),
    };
  });
  
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(user?.ageGroup || null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);

  useEffect(() => {
    if (loggedInAccount) {
      localStorage.setItem('loggedInAccount', JSON.stringify(loggedInAccount));
    } else {
      localStorage.removeItem('loggedInAccount');
    }

    if (user) {
        // Convert Set to Array for JSON serialization
        const userToSave = { ...user, completedLessons: Array.from(user.completedLessons) };
        localStorage.setItem('cyberkids_user', JSON.stringify(userToSave));
    } else {
        localStorage.removeItem('cyberkids_user');
    }
  }, [loggedInAccount, user]);

  const learningPath = useMemo(() => {
    if (!selectedAgeGroup) return null;
    return LEARNING_PATHS[selectedAgeGroup];
  }, [selectedAgeGroup]);
  
  const login = useCallback((name: string, type: 'student' | 'parent' | 'school') => {
    const account = { name, type };
    setLoggedInAccount(account);
    if (type === 'student') {
      const existingUser = localStorage.getItem('cyberkids_user');
      if (existingUser) {
        const parsed = JSON.parse(existingUser);
        if (parsed.name === name) {
          setUser({ ...parsed, completedLessons: new Set(parsed.completedLessons) });
          setSelectedAgeGroup(parsed.ageGroup);
          return;
        }
      }
      setUser(null);
      setSelectedAgeGroup(null);
    }
  }, []);

  const logout = useCallback(() => {
    setLoggedInAccount(null);
    setUser(null);
    setSelectedAgeGroup(null);
    setCurrentModule(null);
    localStorage.removeItem('loggedInAccount');
    localStorage.removeItem('cyberkids_user');
  }, []);

  const selectAgeGroup = useCallback((ageGroup: AgeGroup) => {
    if (!loggedInAccount || loggedInAccount.type !== 'student') return;
    
    setSelectedAgeGroup(ageGroup);
    
    const defaultAvatar: AvatarCustomization = {
        face: AVATAR_OPTIONS.faces[0],
        headwear: 'none',
        eyewear: 'none',
        clothing: 'none',
        backgroundColor: AVATAR_OPTIONS.backgroundColors[0],
    };
    
    const newUser: User = {
        name: loggedInAccount.name,
        ageGroup,
        xp: 0,
        avatarCustomization: defaultAvatar,
        completedLessons: new Set(),
        performance: {},
        badges: [],
        weeklyMissionProgress: {},
        gameState: {},
    };
    setUser(newUser);
  }, [loggedInAccount]);

  const completeLesson = useCallback((lesson: Lesson, performance: PerformanceData) => {
    setUser(currentUser => {
        if (!currentUser) return null;

        const newCompletedLessons = new Set(currentUser.completedLessons);
        if (newCompletedLessons.has(lesson.id)) return currentUser; // Already completed

        newCompletedLessons.add(lesson.id);

        const newBadges = [...currentUser.badges];
        if (!newBadges.includes('first_step')) {
            newBadges.push('first_step');
        }

        const newWeeklyMissionProgress = { ...currentUser.weeklyMissionProgress };
        const mission = CURRENT_WEEKLY_MISSION;
        if (lesson.type === mission.goal.type && !currentUser.badges.includes(mission.rewardBadge)) {
            const currentCount = newWeeklyMissionProgress[mission.id] || 0;
            newWeeklyMissionProgress[mission.id] = currentCount + 1;
            if (newWeeklyMissionProgress[mission.id] >= mission.goal.count) {
                newBadges.push(mission.rewardBadge);
            }
        }
        
        // Check for protector badge
        if (lesson.id === 'tween-l2-10' && !newBadges.includes('protector')) {
            newBadges.push('protector');
        }

        return {
            ...currentUser,
            xp: currentUser.xp + lesson.xp,
            completedLessons: newCompletedLessons,
            performance: {
                ...currentUser.performance,
                [lesson.id]: performance,
            },
            badges: newBadges,
            weeklyMissionProgress: newWeeklyMissionProgress,
        };
    });
  }, []);

  const saveAvatarCustomization = useCallback((customization: AvatarCustomization) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          return { ...currentUser, avatarCustomization: customization };
      });
  }, []);

  const saveGameState = useCallback((lessonId: string, state: any) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        return {
            ...currentUser,
            gameState: {
                ...currentUser.gameState,
                [lessonId]: state,
            },
        };
    });
  }, []);


  const contextValue: AppContextType = {
    loggedInAccount,
    user,
    learningPath,
    weeklyMission: CURRENT_WEEKLY_MISSION,
    login,
    logout,
    selectAgeGroup,
    completeLesson,
    saveAvatarCustomization,
    saveGameState
  };

  const renderContent = () => {
    if (!loggedInAccount) {
      return <Login />;
    }
    
    switch(loggedInAccount.type) {
        case 'parent':
            return (
                <div className="flex flex-col min-h-screen">
                    <Header />
                    <ParentDashboard />
                </div>
            );
        case 'school':
            return (
                <div className="flex flex-col min-h-screen">
                    <Header />
                    <SchoolDashboard />
                </div>
            );
        case 'student':
            if (!user || !selectedAgeGroup) {
                return <AgeSelector />;
            }
            return (
                <div className="flex flex-col md:flex-row min-h-screen bg-white">
                    <UserProfileSidebar />
                    <main className="flex-1 overflow-y-auto">
                        <Header />
                        <Dashboard onModuleSelect={setCurrentModule} />
                    </main>
                    {currentModule && <LessonModal module={currentModule} onClose={() => setCurrentModule(null)} />}
                </div>
            );
        default:
            return <Login />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="font-sans">
        {renderContent()}
        {loggedInAccount && <FeedbackButton />}
      </div>
    </AppContext.Provider>
  );
};

export default App;
