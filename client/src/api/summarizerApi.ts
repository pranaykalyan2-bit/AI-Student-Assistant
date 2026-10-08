import axios from 'axios';

export async function summarizeText(text: string): Promise<string> {
  const { data } = await axios.post<{ summary: string }>('/api/summarizer/summarize', { text });
  return data.summary;
}

export async function summarizeFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axios.post<{ summary: string }>('/api/summarizer/summarize', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.summary;
}
