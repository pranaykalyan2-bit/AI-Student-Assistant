import axios from 'axios';
import type { Quiz, QuizAttempt } from '../types';

export async function generateQuiz(payload: {
  topic: string;
  difficulty: string;
  count: number;
}): Promise<Quiz> {
  const { data } = await axios.post<Quiz>('/api/quiz/generate', payload);
  return data;
}

export async function listQuizzes(): Promise<Quiz[]> {
  const { data } = await axios.get<Quiz[]>('/api/quiz');
  return data;
}

export async function getQuizById(id: number): Promise<Quiz> {
  const { data } = await axios.get<Quiz>(`/api/quiz/${id}`);
  return data;
}

export async function submitAttempt(
  quizId: number,
  score: number,
  totalQuestions: number
): Promise<QuizAttempt> {
  const { data } = await axios.post<QuizAttempt>(`/api/quiz/${quizId}/attempt`, {
    score,
    totalQuestions,
  });
  return data;
}
