// types.ts

export enum AgeGroup {
  KID = '6-9 años',
  TWEEN = '10-13 años',
  TEEN = '14-17 años',
}

export enum LessonType {
  QUIZ = 'QUIZ',
  GAME = 'GAME',
  MISSION = 'MISSION',
  VIDEO = 'VIDEO',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
}

export interface GameContent {
  type: string;
  description: string;
}

export interface MissionContent {
  description: string;
}

export interface VideoContent {
    url: string;
}

export type LessonContent = QuizQuestion[] | GameContent | MissionContent | VideoContent;

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: number;
  xp: number;
  content: LessonContent;
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export interface LearningPath {
  title: string;
  modules: Module[];
}

export interface AvatarCustomization {
  face: string;
  headwear: string;
  eyewear: string;
  clothing: string;
  backgroundColor: string;
}

export interface PerformanceData {
  score: number;
  time: number;
}

export interface User {
  name: string;
  ageGroup: AgeGroup;
  xp: number;
  avatarCustomization: AvatarCustomization;
  completedLessons: Set<string>;
  performance: { [lessonId: string]: PerformanceData };
  badges: string[];
  weeklyMissionProgress: { [missionId: string]: number };
  gameState: { [lessonId: string]: any };
}

export interface LoggedInAccount {
    name: string;
    type: 'student' | 'parent' | 'school';
}

export interface Badge {
  name: string;
  emoji: string;
  description: string;
}

export interface WeeklyMission {
    id: string;
    title: string;
    description: string;
    goal: {
        type: LessonType,
        count: number,
    };
    rewardBadge: string;
}

export interface AppContextType {
  loggedInAccount: LoggedInAccount | null;
  user: User | null;
  learningPath: LearningPath | null;
  weeklyMission: WeeklyMission | null;
  login: (name: string, type: 'student' | 'parent' | 'school') => void;
  logout: () => void;
  selectAgeGroup: (ageGroup: AgeGroup) => void;
  completeLesson: (lesson: Lesson, performance: PerformanceData) => void;
  saveAvatarCustomization: (customization: AvatarCustomization) => void;
  saveGameState: (lessonId: string, state: any) => void;
}
