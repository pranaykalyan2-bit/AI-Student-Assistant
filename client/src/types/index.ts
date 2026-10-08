export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StudyPlan {
  id: number;
  subject: string;
  examDate: string;
  hoursPerDay: number;
  prepLevel: string;
  planContent: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
}

export interface Quiz {
  id: number;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  createdAt: string;
  attempts: QuizAttempt[];
}

export interface Task {
  id: number;
  title: string;
  done: boolean;
  studyPlanId: number | null;
  createdAt: string;
}

export interface DashboardData {
  stats: {
    totalStudyPlans: number;
    totalQuizzes: number;
    averageScore: number;
    tasksCompleted: number;
    totalTasks: number;
  };
  recentStudyPlans: StudyPlan[];
  recentQuizzes: Quiz[];
  tasks: Task[];
}
