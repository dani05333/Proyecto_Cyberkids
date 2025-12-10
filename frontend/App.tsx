// ---------------------------------------------------- 
// App.tsx (VERSIÓN CON ADMIN + DOCENTE)
// ----------------------------------------------------
import React, { useState, createContext, useEffect } from "react";
import axios from "axios";

import {
  AppContextType,
  User,
  Performance,
  Account,
  AgeGroup,
} from "./types";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ParentHome from "./components/ParentHome";
import SchoolDashboard from "./components/SchoolDashboard";
import AgeSelectorPage from "./components/AgeSelectorPage";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard"; // 👈 NUEVO

import FeedbackButton from "./components/FeedbackButton";
import PremiumModal from "./components/PremiumModal";

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

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh")
  );

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Errores del backend para login
  const [lastError, setLastError] = useState<string | null>(null);

  // ----------------------------------------------------
  // 🔄 Restaurar sesión con token
  // ----------------------------------------------------
  useEffect(() => {
    if (!accessToken) return;

    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    const restoreSession = async () => {
      try {
        const meRes = await axios.get("http://127.0.0.1:8000/api/me/");
        const me = meRes.data;

        const role = me.role as User["role"];

        // -----------------------------
        // Estudiante
        // -----------------------------
        if (role === "student") {
          const [studentRes, progressRes] = await Promise.all([
            axios.get(`http://127.0.0.1:8000/api/student/${me.username}/`),
            axios.get("http://127.0.0.1:8000/api/progress/"),
          ]);

          const ageGroup = studentRes.data.age_group as AgeGroup | null;
          const progress = progressRes.data;

          let totalXP = 0;
          const completedLessons = new Set<string>();
          const performance: { [id: string]: Performance } = {};

          progress.forEach((p: any) => {
            if (p.completed) {
              completedLessons.add(p.lesson_id);
              totalXP += p.xp;
            }
            performance[p.lesson_id] = {
              score: p.score,
              time: p.time,
            };
          });

          setUser({
            name: me.username,
            role,
            ageGroup,
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

          setLoggedInAccount({
            name: me.username,
            email: me.email,
            profileType: role || "student",
          });
        }

        // -----------------------------
        // Apoderado / Colegio / Docente / Admin
        // -----------------------------
        else {
          setUser({
            name: me.username,
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

          setLoggedInAccount({
            name: me.username,
            email: me.email,
            profileType: role || "student",
          });
        }
      } catch (err) {
        console.error("❌ Error restaurando sesión:", err);
      }
    };

    restoreSession();
  }, [accessToken]);

  // ----------------------------------------------------
  // Cambiar vista al loguear según rol
  // ----------------------------------------------------
    useEffect(() => {
  if (!user) return;

  if (user.role === "student") {
    if (!user.ageGroup) setView("age-selector");
    else setView("dashboard");
  } else if (user.role === "parent") {
    setView("parent-home");
  } else if (user.role === "teacher") {
    setView("teacher-dashboard");
  } else if (user.role === "school") {
    // si quieres, aquí puedes mandar también al teacher dashboard:
    // setView("teacher-dashboard");
    setView("school-dashboard");
  } else if (user.role === "admin") {
    setView("admin-dashboard");
  }
}, [user, setView]);



  // ----------------------------------------------------
  // CONTEXTO GLOBAL (incluye lastError)
  // ----------------------------------------------------
  const contextValue: AppContextType = {
    view,
    setView,

    user,
    loggedInAccount,

    linkedStudent: null, // según tu types.ts, lo mantienes así
    lastError,
    clearError: () => setLastError(null),

    accessToken,
    refreshToken,

    isPremiumModalOpen,

    // ---------------------------
    // LOGIN
    // ---------------------------
    login: async (username, password, expectedRole = null) => {
      setLastError(null);

      try {
        const res = await axios.post("http://127.0.0.1:8000/api/login/", {
          username,
          password,
          expected_role: expectedRole,
        });

        const { access, refresh } = res.data;

        // Guardar tokens
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        setAccessToken(access);
        setRefreshToken(refresh);

        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        window.location.reload(); // 🔁 recargar la app para restaurar sesión
        return true;
      } catch (err: any) {
        console.error("❌ Error login:", err);

        const msg =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Credenciales inválidas.";

        setLastError(msg);

        return false;
      }
    },

    // ---------------------------
    // REGISTRO
    // ---------------------------
    register: async (username, age, email, password, role) => {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/register/", {
          username,
          age,
          email,
          password,
          role,
        });

        const childPass = res.data.child_password;
        if (childPass) localStorage.setItem("childPassword", childPass);

        return { success: true, error: null };
      } catch (err: any) {
        console.error("❌ Error registro:", err);

        let backendError = "Error desconocido";

        if (err.response?.data?.username)
          backendError = err.response.data.username[0];
        else if (err.response?.data?.email)
          backendError = err.response.data.email[0];
        else if (err.response?.data?.error)
          backendError = err.response.data.error;

        return { success: false, error: backendError };
      }
    },

    // ---------------------------
    // LOGOUT
    // ---------------------------
    logout: () => {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      setAccessToken(null);
      setRefreshToken(null);

      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      setLoggedInAccount(null);

      setView("login");
    },

    // ----------------------------------------------------
    // Requeridos por tipos (stubs)
    // ----------------------------------------------------
    loginStudent: () => false,
    registerStudent: () => false,
    linkStudentAccount: async () => false,

    // ----------------------------------------------------
    // Progreso de estudiante
    // ----------------------------------------------------
    completeLesson: async (lesson, perf) => {
      await axios.post("http://127.0.0.1:8000/api/progress/update/", {
        lesson_id: lesson.id,
        score: perf.score,
        time: perf.time,
        xp: lesson.xp,
      });

      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };

        updated.completedLessons = new Set(prev.completedLessons);
        updated.performance = { ...prev.performance };

        if (!updated.completedLessons.has(lesson.id)) {
          updated.completedLessons.add(lesson.id);
          updated.xp += lesson.xp;
        }

        updated.performance[lesson.id] = perf;
        return updated;
      });
    },

    updateUser: (u) => setUser(u),

    openPremiumModal: () => setIsPremiumModalOpen(true),
    closePremiumModal: () => setIsPremiumModalOpen(false),

    upgradeToPremium: () =>
      setUser((prev) => (prev ? { ...prev, isPremium: true } : prev)),
  };

  // ----------------------------------------------------
  // SISTEMA DE VISTAS
  // ----------------------------------------------------
  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <Dashboard />;

      case "parent-home":
        return <ParentHome />;

      case "school-dashboard":
        return <SchoolDashboard />;

      case "teacher-dashboard":
        return <TeacherDashboard />; // 👈 NUEVA VISTA DOCENTE

      case "admin-dashboard":
        return <AdminDashboard />;

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
