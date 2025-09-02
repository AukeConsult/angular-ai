import { Component, ElementRef, ViewChild, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatgptService, HistoryMessage } from '../services/chatgpt.service';
import { ChatStoreService, Conversation, ChatItem } from '../services/chat-store.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewInit {
  userMessage = '';
  isSending = false;

  models = ['gpt-4.1-mini', 'gpt-4o-mini', 'o4-mini'];
  selectedModel = 'gpt-4.1-mini';
  useRag = true;

  vectorStoreId = 'vs_68af29fb0da481919883202b65cdfe78';
  ragInstructions =
    "Du er en RAG-assistent. Du MÅ alltid bruke file_search før du svarer. " +
    "Hvis ingen relevante treff: svar 'Ingen treff i dokumentene.' og ikke gjett. Svar på norsk.";

  conversationsSig = signal<Conversation[]>([]);
  activeConv = signal<Conversation | null>(null);
  activeMessageCount = computed(() => this.activeConv()?.messages?.length ?? 0);

  @ViewChild('historyRef') historyRef?: ElementRef<HTMLDivElement>;
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLTextAreaElement>;

  constructor(private api: ChatgptService, private store: ChatStoreService) { this.refresh(); }

  ngAfterViewInit() { this.focusInput(); this.scrollSoon(); }

  private refresh() { this.conversationsSig.set(this.store.getAll()); this.activeConv.set(this.store.getActive()); this.scrollSoon(); }
  private focusInput() { setTimeout(()=>this.inputRef?.nativeElement?.focus(), 0); }
  private scrollSoon() { setTimeout(()=>{ const el=this.historyRef?.nativeElement; if (el) el.scrollTop=el.scrollHeight; }, 0); }

  paragraphs(t: string) { return t.split(/\n+/g); }
  trackById(_: number, c: Conversation) { return c.id; }
  trackByIndex(i: number) { return i; }

  onTextareaInput() { const ta=this.inputRef?.nativeElement; if(!ta) return; ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,240)+'px'; }
  onComposerKeydown(e: KeyboardEvent) { if(e.key==='Enter' && !e.shiftKey && !this.isSending){ e.preventDefault(); this.send(); } }

  newChat(){ this.store.create('New chat'); this.userMessage=''; this.isSending=false; this.refresh(); this.focusInput(); }
  selectChat(id: string){ this.store.setActive(id); this.userMessage=''; this.isSending=false; this.refresh(); this.focusInput(); }
  renameChat(c: Conversation){ const n=prompt('Rename chat:', c.title); if(n!=null){ this.store.rename(c.id,n); this.refresh(); } }
  deleteChat(c: Conversation){ if(confirm('Delete this chat?')){ this.store.delete(c.id); this.refresh(); } }
  clearChat(c: Conversation){ if(confirm('Clear all messages?')){ this.store.clearMessages(c.id); this.refresh(); } }

  private buildApiHistory(conv: Conversation | null): HistoryMessage[] {
    if (!conv) return [];
    return conv.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user'|'assistant', content: m.content }));
  }

  send() {
    const conv = this.store.getActive();
    const msg = this.userMessage.trim();
    if (!conv || !msg || this.isSending) return;

    this.store.appendMessage(conv.id, { role: 'user', content: msg } as ChatItem);
    this.store.setFirstLineAsTitle(conv.id);
    this.refresh();

    this.userMessage = '';
    this.onTextareaInput();
    this.isSending = true;

    const history = this.buildApiHistory(conv);

    const req$ = this.useRag
      ? this.api.sendResponseWithRAG({
        model: this.selectedModel,
        instructions: this.ragInstructions,
        vectorStoreId: this.vectorStoreId,
        prompt: msg,
        history,
      })
      : this.api.sendChat(this.selectedModel, msg, history);

    req$.subscribe({
      next: reply => { this.store.appendMessage(conv.id, { role: 'assistant', content: reply } as ChatItem); this.isSending = false; this.refresh(); this.focusInput(); },
      error: err => {
        const detail = err?.error?.error?.message || err?.message || 'API error';
        this.store.appendMessage(conv.id, { role: 'error', content: detail } as ChatItem);
        this.isSending = false; this.refresh(); this.focusInput();
      },
    });
  }
}
