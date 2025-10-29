import React, { useState, createContext, useEffect } from 'react';
import { AppContextType, User, Lesson, Performance, Account, ProfileType } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AgeSelector from './components/AgeSelector';
import ParentDashboard from './components/ParentDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import FeedbackButton from './components/FeedbackButton';
import PremiumModal from './components/PremiumModal';
import axios from 'axios';
import ParentHome from './components/ParentHome';



// 🧩 Creamos el contexto
export const AppContext = createContext<AppContextType | null>(null);

// (Opcional) Base de datos temporal mientras conectas todo el backend
const MOCK_DB = {
  users: new Map<string, User>(),
  accounts: new Map<string, { password: string; account: Account }>(),
};

const App: React.FC = () => {
  const [view, setView] = useState<AppContextType['view']>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loggedInAccount, setLoggedInAccount] = useState<Account | null>(null);
  const [linkedStudent, setLinkedStudent] = useState<User | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // 🔄 Controla qué vista mostrar según el tipo de usuario
  useEffect(() => {
  if (user) {
    setView('dashboard');
  } else if (loggedInAccount?.profileType === ProfileType.PARENT) {
    setView('parent-home');
  }
}, [user, loggedInAccount]);


  // ⚙️ Aquí definimos todas las funciones globales (login, register, etc.)
  const contextValue: AppContextType = {
    view,
    user,
    loggedInAccount,
    linkedStudent,
    isPremiumModalOpen,

    openPremiumModal: () => setIsPremiumModalOpen(true),
    closePremiumModal: () => setIsPremiumModalOpen(false),

    upgradeToPremium: () => {
      if (user) {
        const updatedUser = { ...user, isPremium: true };
        setUser(updatedUser);
        MOCK_DB.users.set(user.name.toLowerCase(), updatedUser);
      }
    },

    // ✅ LOGIN conectado al backend
    login: async (email, password) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/login/", {
      username: email, // puede ser username o email, según lo que pongas en el campo
      password,
    });

    const { access, refresh, username, role } = response.data;

    // Guardar tokens
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    // Actualizar estado según rol
    const account = { name: username, email, profileType: role };
    setLoggedInAccount(account);

    // Cambiar vista automáticamente según tipo de usuario
    if (role === "student") {
      setView("dashboard");
    } else if (role === "parent") {
      setView("parent-home");
    } else if (role === "teacher") {
      setView("school-dashboard");
    } else {
      setView("dashboard");
    }

    return true;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return false;
  }
},

    // 🔸 Login de estudiantes locales (puedes eliminarlo luego)
    loginStudent: (name) => {
      const storedUser = MOCK_DB.users.get(name.toLowerCase());
      if (storedUser) {
        setUser(storedUser);
        return true;
      }
      return false;
    },

    // ✅ Cerrar sesión
    logout: () => {
      setUser(null);
      setLoggedInAccount(null);
      setLinkedStudent(null);
      setView('login');
    },

    // ✅ REGISTRO conectado al backend
    register: async (name, age, email, password, profileType) => {
      try {
        await axios.post('http://127.0.0.1:8000/api/register/', {
          username: name,
          email,
          password,
          age,
          role:
            profileType === 'parent'
              ? 'parent'
              : profileType === 'school'
              ? 'teacher'
              : 'student',
        });
        setLoggedInAccount({ name, email, profileType });
        return true;
      } catch (error) {
        console.error('Error al registrar:', error);
        return false;
      }
    },

    // 🔸 Registro de estudiante (local temporal)
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
          backgroundColor: 'bg-sky-200',
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

    // 🔸 Completar lección (todavía local)
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

    // 🔸 Actualizar usuario (local)
    updateUser: (updatedUser: User) => {
      setUser(updatedUser);
      MOCK_DB.users.set(updatedUser.name.toLowerCase(), updatedUser);
    },

    // 🔸 Vincular estudiante con apoderado (local)
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

  // 🔸 Renderiza la vista actual (login, dashboards, etc.)
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'parent-dashboard':
        return <ParentDashboard />;
        case 'parent-home':
  return <ParentHome />;
      case 'school-dashboard':
        return <SchoolDashboard />;
      case 'age-selector':
        return <AgeSelector />;
      case 'login':
      default:
        return <Login setView={setView} />;
    }
  };

  // 🔸 Render final de la aplicación
  return (
    <AppContext.Provider value={contextValue}>
      {renderView()}
      {(user || loggedInAccount) && <FeedbackButton />}
      {isPremiumModalOpen && <PremiumModal onClose={contextValue.closePremiumModal} />}
    </AppContext.Provider>
  );
};

export default App;
