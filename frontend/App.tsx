import React, { useState, createContext, useEffect } from 'react';
import { AppContextType, User, AgeGroup, Lesson, Performance, Account, ProfileType } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AgeSelector from './components/AgeSelector';
import ParentDashboard from './components/ParentDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import FeedbackButton from './components/FeedbackButton';
import PremiumModal from './components/PremiumModal';

export const AppContext = createContext<AppContextType | null>(null);

// Mock storage for demo purposes
const MOCK_DB = {
    users: new Map<string, User>(),
    accounts: new Map<string, { password: string, account: Account }>(),
};

const App: React.FC = () => {
    const [view, setView] = useState<AppContextType['view']>('login');
    const [user, setUser] = useState<User | null>(null);
    const [loggedInAccount, setLoggedInAccount] = useState<Account | null>(null);
    const [linkedStudent, setLinkedStudent] = useState<User | null>(null);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setView('dashboard');
        } else if (loggedInAccount) {
            if (loggedInAccount.profileType === ProfileType.PARENT) {
                if (loggedInAccount.linkedStudentName && MOCK_DB.users.has(loggedInAccount.linkedStudentName.toLowerCase())) {
                    setLinkedStudent(MOCK_DB.users.get(loggedInAccount.linkedStudentName.toLowerCase())!);
                }
                setView('parent-dashboard');
            } else if (loggedInAccount.profileType === ProfileType.SCHOOL) {
                setView('school-dashboard');
            }
        } else {
            setView('login');
        }
    }, [user, loggedInAccount]);

    const contextValue: AppContextType = {
        view,
        user,
        loggedInAccount,
        linkedStudent,
        isPremiumModalOpen,
        openPremiumModal: () => setIsPremiumModalOpen(true),
        closePremiumModal: () => setIsPremiumModalOpen(false),
        upgradeToPremium: () => {
            if(user) {
                const updatedUser = { ...user, isPremium: true };
                setUser(updatedUser);
                MOCK_DB.users.set(user.name.toLowerCase(), updatedUser);
            }
        },
        login: (email, password) => {
            const stored = MOCK_DB.accounts.get(email.toLowerCase());
            if (stored && stored.password === password) {
                setLoggedInAccount(stored.account);
                return true;
            }
            return false;
        },
        loginStudent: (name) => {
            const storedUser = MOCK_DB.users.get(name.toLowerCase());
            if (storedUser) {
                setUser(storedUser);
                return true;
            }
            return false;
        },
        logout: () => {
            setUser(null);
            setLoggedInAccount(null);
            setLinkedStudent(null);
            setView('login');
        },
        register: (name, age, email, password, profileType) => {
            if (MOCK_DB.accounts.has(email.toLowerCase())) return false;
            const newAccount: Account = { name, email, profileType };
            MOCK_DB.accounts.set(email.toLowerCase(), { password, account: newAccount });
            setLoggedInAccount(newAccount);
            return true;
        },
        registerStudent: (name, ageGroup) => {
            if (MOCK_DB.users.has(name.toLowerCase())) return false;
            const newUser: User = {
                name,
                ageGroup,
                xp: 0,
                isPremium: false,
                avatarCustomization: {
                    face: '🧑‍🚀',
                    headwear: 'none',
                    eyewear: 'none',
                    clothing: 'tshirt',
                    backgroundColor: 'bg-sky-200'
                },
                completedLessons: new Set(),
                performance: {},
                badges: [],
                weeklyMissionProgress: {},
                gameState: {},
            };
            MOCK_DB.users.set(name.toLowerCase(), newUser);
            setUser(newUser);
            return true;
        },
        completeLesson: (lesson, performance) => {
            if (!user) return;
            const updatedUser = { ...user };
            updatedUser.completedLessons = new Set(user.completedLessons);
            if (!updatedUser.completedLessons.has(lesson.id)) {
                updatedUser.xp += lesson.xp;
                updatedUser.completedLessons.add(lesson.id);
            }
            updatedUser.performance = { ...user.performance, [lesson.id]: performance };
            setUser(updatedUser);
            MOCK_DB.users.set(user.name.toLowerCase(), updatedUser);
        },
        updateUser: (updatedUser: User) => {
             setUser(updatedUser);
             MOCK_DB.users.set(updatedUser.name.toLowerCase(), updatedUser);
        },
        linkStudentAccount: async (studentName: string) => {
            if (loggedInAccount && loggedInAccount.profileType === ProfileType.PARENT) {
                 const student = MOCK_DB.users.get(studentName.toLowerCase());
                 if (student) {
                     const updatedAccount = { ...loggedInAccount, linkedStudentName: student.name };
                     setLoggedInAccount(updatedAccount);
                     setLinkedStudent(student);
                     MOCK_DB.accounts.get(loggedInAccount.email.toLowerCase())!.account = updatedAccount;
                     return true;
                 }
            }
            return false;
        },
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard />;
            case 'parent-dashboard':
                return <ParentDashboard />;
            case 'school-dashboard':
                return <SchoolDashboard />;
            case 'age-selector':
                return <AgeSelector />;
            case 'login':
            default:
                return <Login setView={setView} />;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            {renderView()}
            {(user || loggedInAccount) && <FeedbackButton />}
            {isPremiumModalOpen && <PremiumModal onClose={contextValue.closePremiumModal} />}
        </AppContext.Provider>
    );
};

export default App;