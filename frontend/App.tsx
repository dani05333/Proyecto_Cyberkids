// App.tsx (VERSIÓN COMPLETA Y CORREGIDA)
import React, { useState, createContext, useEffect } from "react";
import axios from "axios";

import {
  AppContextType,
  User,
  Lesson,
  Performance,
  Account,
  AgeGroup,
} from "./types";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ParentDashboard from "./components/ParentDashboard";
import SchoolDashboard from "./components/SchoolDashboard";
import ParentHome from "./components/ParentHome";
import FeedbackButton from "./components/FeedbackButton";
import PremiumModal from "./components/PremiumModal";
import AgeSelectorPage from "./components/AgeSelectorPage";

// ----------------------------------------------------
// CONTEXTO GLOBAL
// ----------------------------------------------------
export const AppContext = createContext<AppContextType | null>(null);

// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------
const App: React.FC = () => {
  const [view, setView] = useState<AppContextType["view"]>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loggedInAccount, setLoggedInAccount] = useState<Account | null>(null);
  const [linkedStudent, setLinkedStudent] = useState<User | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // --------------------------------------------------------
  // ✔ RESTAURAR SESIÓN AUTOMÁTICAMENTE SI HAY TOKEN
  // --------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const restoreSession = async () => {
      try {
        const meRes = await axios.get("http://127.0.0.1:8000/api/me/");
        const userData = meRes.data;

        const role = userData.role;

        // Si es estudiante, cargar progreso también
        if (role === "student") {
          const [studentRes, progressRes] = await Promise.all([
            axios.get(
              `http://127.0.0.1:8000/api/student/${userData.username}/`
            ),
            axios.get("http://127.0.0.1:8000/api/progress/")
          ]);

          const age_group = studentRes.data.age_group as AgeGroup | null;

          const progressData = progressRes.data;

          const completedLessons = new Set<string>();
          const performance: { [lessonId: string]: Performance } = {};
          let totalXP = 0;

          progressData.forEach((p: any) => {
            performance[p.lesson_id] = {
              score: p.score,
              time: p.time,
            };
            if (p.completed) {
              completedLessons.add(p.lesson_id);
              totalXP += p.xp || 0;
            }
          });

          setLoggedInAccount({
            name: userData.username,
            email: "", // si quieres cargar email, agrégalo al endpoint /me
            profileType: role,
          });

          setUser({
            name: userData.username,
            role,
            ageGroup: age_group,
            xp: totalXP,
            isPremium: false,
            avatarCustomization: {
              face: "🧑‍🚀",
              headwear: "none",
              eyewear: "none",
              clothing: "tshirt",
              backgroundColor: "bg-sky-200",
            },
            completedLessons,
            performance,
            badges: [],
            weeklyMissionProgress: {},
            gameState: {},
          });
        } else {
          // padre o colegio
          setLoggedInAccount({
            name: userData.username,
            email: "",
            profileType: role,
          });

          setUser({
            name: userData.username,
            role,
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
        }
      } catch (err) {
        console.error("❌ No se pudo restaurar la sesión:", err);
      }
    };

    restoreSession();
  }, []);

  // --------------------------------------------------------
  // Cambiar vista según el tipo de usuario
  // --------------------------------------------------------
  useEffect(() => {
    if (user?.role === "student") {
      if (!user.ageGroup) setView("age-selector");
      else setView("dashboard");
    } else if (loggedInAccount?.profileType === "parent") {
      setView("parent-home");
    } else if (loggedInAccount?.profileType === "school") {
      setView("school-dashboard");
    }
  }, [user, loggedInAccount]);

  // --------------------------------------------------------
  // CONTEXTO GLOBAL
  // --------------------------------------------------------
  const contextValue: AppContextType = {
    view,
    user,
    loggedInAccount,
    linkedStudent,
    isPremiumModalOpen,

    // ----------------------------------------
    // LOGIN
    // ----------------------------------------
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

        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        // Restaurar sesión desde cero
        window.location.reload();
        return true;
      } catch (err) {
        console.error("❌ Error en login:", err);
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setLoggedInAccount(null);
      setView("login");
    },

    register: async () => false,
    loginStudent: () => false,
    registerStudent: () => false,

    // ----------------------------------------
    completeLesson: (lesson, perf) => {
      axios.post("http://127.0.0.1:8000/api/progress/update/", {
        lesson_id: lesson.id,
        score: perf.score,
        time: perf.time,
        xp: lesson.xp,
      });

      setUser((prev) => {
        if (!prev) return prev;

        const updated = {
          ...prev,
          completedLessons: new Set(prev.completedLessons),
          performance: { ...prev.performance },
        };

        if (!updated.completedLessons.has(lesson.id)) {
          updated.completedLessons.add(lesson.id);
          updated.xp += lesson.xp;
        }

        updated.performance[lesson.id] = perf;
        return updated;
      });
    },

    updateUser: (updatedUser) => setUser(updatedUser),

    openPremiumModal: () => setIsPremiumModalOpen(true),
    closePremiumModal: () => setIsPremiumModalOpen(false),

    upgradeToPremium: () => {
      setUser((prev) => (prev ? { ...prev, isPremium: true } : prev));
    },

    linkStudentAccount: async () => false,
  };

  // --------------------------------------------------------
  // SISTEMA DE VISTAS
  // --------------------------------------------------------
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
          <AgeSelectorPage username={user?.name || ""} setView={setView} />
        );

      default:
        return <Login setView={setView} />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {renderView()}
      {user && <FeedbackButton />}
      {isPremiumModalOpen && (
        <PremiumModal onClose={contextValue.closePremiumModal} />
      )}
    </AppContext.Provider>
  );
};

export default App;
