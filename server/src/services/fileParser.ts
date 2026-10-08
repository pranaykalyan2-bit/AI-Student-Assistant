// @ts-ignore
import pdfParse from 'pdf-parse'

export async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer)
    return data.text as string
  }

  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8')
  }

  throw new Error(`Unsupported file type: ${mimetype}. Only PDF and plain text are accepted.`)
}
