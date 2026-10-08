import axios from 'axios';
import type { Task } from '../types';

export async function createTask(title: string, studyPlanId?: number): Promise<Task> {
  const { data } = await axios.post<Task>('/api/tasks', { title, studyPlanId });
  return data;
}

export async function updateTask(id: number, payload: { done?: boolean; title?: string }): Promise<Task> {
  const { data } = await axios.patch<Task>(`/api/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await axios.delete(`/api/tasks/${id}`);
}
