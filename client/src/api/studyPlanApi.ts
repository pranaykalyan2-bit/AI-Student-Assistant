import axios from 'axios';
import type { StudyPlan } from '../types';

export async function generateStudyPlan(payload: {
  subject: string;
  examDate: string;
  hoursPerDay: number;
  prepLevel: string;
}): Promise<StudyPlan> {
  const { data } = await axios.post<StudyPlan>('/api/study-plan/generate', payload);
  return data;
}

export async function listStudyPlans(): Promise<StudyPlan[]> {
  const { data } = await axios.get<StudyPlan[]>('/api/study-plan');
  return data;
}

export async function deleteStudyPlan(id: number): Promise<void> {
  await axios.delete(`/api/study-plan/${id}`);
}
