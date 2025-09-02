import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ChatRole = 'user' | 'assistant';
export interface HistoryMessage { role: ChatRole; content: string; }

@Injectable({ providedIn: 'root' })
export class ChatgptService {
  private readonly RESPONSES_URL = 'https://api.openai.com/v1/responses';
  private raw: HttpClient;

  constructor(backend: HttpBackend) {
    // bypass interceptors so nothing tampers with auth headers
    this.raw = new HttpClient(backend);
  }

  /** Matches your Postman request exactly */
  sendResponseWithRAG(opts: {
    model: string;                 // e.g. 'gpt-4.1' or 'gpt-4.1-mini'
    instructions?: string;         // optional system prompt
    vectorStoreId: string;         // vs_...
    prompt: string;
    history?: HistoryMessage[];
  }): Observable<string> {
    const headers: Record<string,string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiKey}`,
      'OpenAI-Beta': 'assistants=v2',
    };
    if (environment.openaiProject) headers['OpenAI-Project'] = environment.openaiProject;

    const tools = [{
      type: 'file_search',
      // ← inline like your Postman screenshot
      vector_store_ids: [opts.vectorStoreId]
    }];

    const input =
      opts.history?.length
        ? [...opts.history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: opts.prompt }]
        : opts.prompt;

    const body: any = { model: opts.model, input, tools };
    if (opts.instructions) body.instructions = opts.instructions;

    return this.raw.post<any>(this.RESPONSES_URL, body, { headers })
      .pipe(map(this.extractResponseText));
  }

  private extractResponseText = (res: any): string => {
    if (typeof res?.output_text === 'string' && res.output_text.trim()) return res.output_text.trim();
    const out: string[] = [];
    if (Array.isArray(res?.output)) {
      for (const item of res.output) {
        for (const part of item?.content ?? []) {
          if (typeof part?.text === 'string') out.push(part.text);
          else if (part?.type === 'output_text' && typeof part?.text === 'string') out.push(part.text);
        }
      }
    }
    if (!out.length && res?.choices?.[0]?.message?.content) {
      const c = res.choices[0].message.content;
      Array.isArray(c) ? c.forEach((p: any) => p?.text && out.push(p.text)) : out.push(c);
    }
    return out.join('\n').trim() || '(empty)';
  };

  /** Classic Chat Completions (no tools/RAG) */
  sendChat(model: string, prompt: string, history: HistoryMessage[] = []) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiKey}`,
    };
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt }
    ];
    return this.raw.post<any>('https://api.openai.com/v1/chat/completions',
      { model, messages },
      { headers }
    ).pipe(
      // simple extractor
      map(r => r?.choices?.[0]?.message?.content ?? '(no content)')
    );
  }

}
