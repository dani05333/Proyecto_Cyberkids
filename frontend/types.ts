// --------------------------------------------------------
// ENUM ORIGINAL QUE USA constants.ts
// --------------------------------------------------------
export enum AgeGroup {
  KID = "KID",
  TWEEN = "TWEEN",
  TEEN = "TEEN",
}

// --------------------------------------------------------
// PerfilType
// --------------------------------------------------------
export enum ProfileType {
  STUDENT = "student",
  PARENT = "parent",
  SCHOOL = "school",
  ADMIN = "admin", // 👈 NUEVO
}

// --------------------------------------------------------
// Interfaces auxiliares
// --------------------------------------------------------
export interface Performance {
  score: number;
  time: number;
}

export interface AvatarCustomization {
  face: string;
  headwear: string;
  eyewear: string;
  clothing: string;
  backgroundColor: string;
}

// --------------------------------------------------------
// USUARIO
// --------------------------------------------------------
export interface User {
  id?: number;

  username?: string;
  email?: string;

  // 👇 ahora incluye admin
  role?: "student" | "parent" | "school" | "admin";

  linked_parent?: string | null;

  // nombre mostrado en frontend
  name?: string;

  // 🔥 Grupo etario (KID/TWEEN/TEEN)
  ageGroup?: AgeGroup | null;

  // 🔥 Edad real (solo registro / info)
  age?: string | number | null;

  xp: number;
  isPremium: boolean;

  avatarCustomization: AvatarCustomization;
  completedLessons: Set<string>;
  performance: { [lessonId: string]: Performance };
  badges: string[];
  weeklyMissionProgress: { [missionId: string]: number };
  gameState: { [gameId: string]: any };
}

export interface Account {
  name: string;
  email: string;

  // 👇 ahora también puede ser admin
  profileType: "parent" | "school" | "student" | "admin";

  linkedStudentName?: string;
}

// --------------------------------------------------------
// Contenidos
// --------------------------------------------------------
export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
};

export type VideoContent = { url: string };
export type GameContent = { type: string; description: string };
export type MissionContent = { description: string };
export type PracticeCaseContent = {
  scenario: string;
  questions: {
    question: string;
    options: string[];
    correctOption: string;
    explanation: string;
  }[];
};

// --------------------------------------------------------
// Módulos
// --------------------------------------------------------
export interface Lesson {
  id: string;
  title: string;
  type: "quiz" | "video" | "game" | "mission" | "practice-case";
  xp: number;
  content:
    | QuizQuestion[]
    | VideoContent
    | GameContent
    | MissionContent
    | PracticeCaseContent;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  isPremium?: boolean;
}

export interface LearningPath {
  ageGroup: AgeGroup;
  modules: Module[];
}

export interface Badge {
  name: string;
  description: string;
  emoji: string;
}

// --------------------------------------------------------
// VISTAS
// --------------------------------------------------------
export type ViewType =
  | "login"
  | "age-selector"
  | "dashboard"
  | "parent-home"
  | "school-dashboard"
  | "admin-dashboard"   // 👈 NUEVA VISTA ADMIN
  | "register-student";

// --------------------------------------------------------
// CONTEXTO GLOBAL
// --------------------------------------------------------
export interface AppContextType {
  view: ViewType;
  setView: (view: ViewType) => void;

  user: User | null;
  loggedInAccount: Account | null;
  linkedStudent: User | null;

  accessToken: string | null;
  refreshToken: string | null;

  // 🔥 Manejo de errores globales
  lastError: string | null;
  clearError: () => void;

  // Login unificado
  login: (
    emailOrUsername: string,
    password: string,
    expectedRole?: string | null
  ) => Promise<boolean>;

  // Registro
  register: (
    name: string,
    age: number,
    email: string,
    password: string,
    role: string
  ) => Promise<{ success: boolean; error: string | null }>;

  // Legacy (compatibilidad)
  loginStudent: (name: string) => boolean;
  registerStudent: (name: string, ageGroup: AgeGroup) => boolean;

  logout: () => void;

  // Progreso del estudiante
  completeLesson: (lesson: Lesson, performance: Performance) => void;

  updateUser: (updatedUser: User) => void;

  // Relación apoderado → estudiante
  linkStudentAccount: (studentName: string) => Promise<boolean>;

  // Premium
  isPremiumModalOpen: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  upgradeToPremium: () => void;
}

// --------------------------------------------------------
// Modelo School
// --------------------------------------------------------
export interface Classroom {
  id: string;
  name: string;
  teacher: string;
}

export interface Student {
  id: string;
  name: string;
  xp: number;
  classId: string;
  lastActivity: string;
}
