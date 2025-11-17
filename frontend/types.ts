
 
export enum AgeGroup {
  KID = 'KID',
  TWEEN = 'TWEEN',
  TEEN = 'TEEN',
}


export enum ProfileType {
  STUDENT = 'student',
  PARENT = 'parent',
  SCHOOL = 'school',
}

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

export interface User {
  // 🔹 Campos del backend Django
  id?: number;
  username?: string;   // <-- El nombre de usuario del backend
  email?: string;      // <-- Correo si existe
  role?: string;       // <-- "student" | "parent" | "teacher"
  linked_parent?: string | null; // <-- Apoderado vinculado, si aplica

  // 🔹 Campos locales (para compatibilidad con MOCK_DB)
  name?: string;
  ageGroup?: AgeGroup;
  xp: number;
  isPremium: boolean;

  // 🔹 Campos relacionados con el progreso y personalización
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
  // FIX: Changed profileType to use string literals to resolve a type conflict in App.tsx.
  profileType: 'parent' | 'school';
  linkedStudentName?: string;
}

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
};

export type VideoContent = {
  url: string;
};

export type GameContent = {
  type: string;
  description: string;
};

export type MissionContent = {
  description: string;
};

export type PracticeCaseContent = {
  scenario: string;
  questions: {
    question: string;
    options: string[];
    correctOption: string;
    explanation: string;
  }[];
};

export interface Lesson {
  id: string;
  title: string;
  type: 'quiz' | 'video' | 'game' | 'mission' | 'practice-case';
  xp: number;
  content: QuizQuestion[] | VideoContent | GameContent | MissionContent | PracticeCaseContent;
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

export interface AppContextType {
  view: 'login' | 'age-selector' | 'dashboard' | 'parent-dashboard' | 'school-dashboard' | 'register-student';
  user: User | null;
  loggedInAccount: Account | null;
  linkedStudent: User | null;
  login: (emailOrUsername: string, password: string, role?: string) => Promise<boolean>;
  loginStudent: (name: string) => boolean;
  logout: () => void;
register: (
  name: string,
  age: number,
  email: string,
  password: string,
  role: string
) => Promise<boolean>;
  registerStudent: (name: string, ageGroup: AgeGroup) => boolean;
  completeLesson: (lesson: Lesson, performance: Performance) => void;
  updateUser: (updatedUser: User) => void;
  linkStudentAccount: (studentName: string) => Promise<boolean>;
  isPremiumModalOpen: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  upgradeToPremium: () => void;
}


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