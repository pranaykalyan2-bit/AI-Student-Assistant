import axios from 'axios';
import type { DashboardData } from '../types';

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await axios.get<DashboardData>('/api/dashboard');
  return data;
}
