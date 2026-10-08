import axios from 'axios';
import type { Message } from '../types';

export async function sendChat(messages: Message[]): Promise<string> {
  const { data } = await axios.post<{ reply: string }>('/api/ai/chat', { messages });
  return data.reply;
}
