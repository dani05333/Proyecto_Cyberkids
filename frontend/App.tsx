import React, { useState, createContext, useEffect } from "react";
import axios from "axios";

import {
  AppContextType,
  User,
  Lesson,
  Performance,
  Account,
  ProfileType,
} from "./types";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ParentDashboard from "./components/ParentDashboard";
import SchoolDashboard from "./components/SchoolDashboard";
import ParentHome from "./components/ParentHome";
import FeedbackButton from "./components/FeedbackButton";
import PremiumModal from "./components/PremiumModal";
import AgeSelectorPage from "./components/AgeSelectorPage";

// ------------------------------
// CONTEXTO GLOBAL
// ------------------------------
export const AppContext = createContext<AppContextType | null>(null);

// Base temporal (necesaria para cumplir AppContextType)
const MOCK_DB = {
  users: new Map<string, User>(),
};

// ------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------
const App: React.FC = () => {
  const [view, setView] = useState<AppContextType["view"]>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loggedInAccount, setLoggedInAccount] = useState<Account | null>(null);
  const [linkedStudent, setLinkedStudent] = useState<User | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // --------------------------------------------------------
  // 🔄 Selector automático de vista según el tipo de usuario
  // --------------------------------------------------------
  useEffect(() => {
    if (user?.role === "student") {
      // Si el estudiante no tiene grupo → ir a la selección
      if (!user.ageGroup) {
        setView("age-selector");
      } else {
        setView("dashboard");
      }
    } else if (loggedInAccount?.profileType === "parent") {
      setView("parent-home");
    } else if (loggedInAccount?.profileType === "school") {
      setView("school-dashboard");
    }
  }, [user, loggedInAccount]);

  // ------------------------------
  // 🔧 FUNCIONES DEL CONTEXTO
  // ------------------------------
  const contextValue: AppContextType = {
    view,
    user,
    loggedInAccount,
    linkedStudent,
    isPremiumModalOpen,

    // ------------------------------
    // LOGIN COMPLETAMENTE CONECTADO
    // ------------------------------
    login: async (email, password, expectedRole = null) => {
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/login/", {
          username: email,
          password,
          expected_role: expectedRole,
        });

        const { access, refresh, username, role } = response.data;

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        setLoggedInAccount({
          name: username,
          email,
          profileType: role,
        });

        // Crear usuario inicial vacío (edad se cargará desde backend luego)
        setUser({
          name: username,
          role: role,
          ageGroup: null,
          xp: 0,
          isPremium: false,
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
        });

        return true;
      } catch (err) {
        console.error("❌ Error en login:", err);
        return false;
      }
    },

    // ------------------------------
    logout: () => {
      setUser(null);
      setLoggedInAccount(null);
      setLinkedStudent(null);
      setView("login");
    },

    // ------------------------------
    // REGISTRO CONECTADO AL BACKEND
    // ------------------------------
    register: async (name, age, email, password, profileType) => {
      try {
        await axios.post("http://127.0.0.1:8000/api/register/", {
          username: name,
          email,
          password,
          age,
          role:
            profileType === "parent"
              ? "parent"
              : profileType === "school"
              ? "teacher"
              : "student",
        });

        setLoggedInAccount({
          name,
          email,
          profileType,
        });

        return true;
      } catch (error) {
        console.error("❌ Error al registrar:", error);
        return false;
      }
    },

    // ------------------------------
    // Requeridos para AppContextType
    // ------------------------------
    loginStudent: () => false, // no lo usas pero es obligatorio
    registerStudent: () => false, // no se usa, pero necesario

    // ------------------------------
    completeLesson: (lesson: Lesson, performance: Performance) => {
      if (!user) return;
      const updated = { ...user };

      updated.completedLessons = new Set(updated.completedLessons);
      if (!updated.completedLessons.has(lesson.id)) {
        updated.completedLessons.add(lesson.id);
        updated.xp += lesson.xp;
      }

      updated.performance = {
        ...updated.performance,
        [lesson.id]: performance,
      };

      setUser(updated);
    },

    updateUser: (updatedUser) => {
      setUser(updatedUser);
    },

    // ------------------------------
    openPremiumModal: () => setIsPremiumModalOpen(true),
    closePremiumModal: () => setIsPremiumModalOpen(false),

    upgradeToPremium: () => {
      if (!user) return;
      const updated = { ...user, isPremium: true };
      setUser(updated);
    },

    linkStudentAccount: async () => false,
  };

  // ------------------------------
  // SISTEMA DE VISTAS
  // ------------------------------
  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <Dashboard />;

      case "parent-home":
        return <ParentHome />;

      case "school-dashboard":
        return <SchoolDashboard />;

      case "age-selector":
        return (
          <AgeSelectorPage
            username={localStorage.getItem("student_username") || ""}
            setView={setView}
          />
        );

      default:
        return <Login setView={setView} />;
    }
  };

  // ------------------------------
  // RENDER FINAL
  // ------------------------------
  return (
    <AppContext.Provider value={contextValue}>
      {renderView()}
      {(user || loggedInAccount) && <FeedbackButton />}
      {isPremiumModalOpen && (
        <PremiumModal onClose={contextValue.closePremiumModal} />
      )}
    </AppContext.Provider>
  );
};

export default App;
