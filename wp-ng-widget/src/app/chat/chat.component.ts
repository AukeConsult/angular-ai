import { Component, AfterViewInit, ElementRef, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatgptService, HistoryMessage } from '../services/chatgpt.service';

type Role = 'user' | 'assistant' | 'error';
interface Message { role: Role; content: string; }

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('historyRef') historyRef?: ElementRef<HTMLDivElement>;
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChildren('msgItem') msgItems!: QueryList<ElementRef<HTMLElement>>;

  messages: Message[] = [];
  userMessage = '';
  isSending = false;

  suggestions = [
    "Gi meg et kort sammendrag av dette ",
    "Hva er de viktigste punktene her?",
    "Forklar denne koden trinn for trinn",
    "Skriv en e-post basert på dette",
    "Finn feil og foreslå forbedringer",
  ];
  currentSuggestion = this.suggestions[0];
  private suggestionIndex = 0;
  private suggestionTimer: any;
  animateSwap = false;

  models = ['gpt-4.1-mini', 'gpt-4o-mini', 'o4-mini'];
  selectedModel = 'gpt-4.1-mini';
  useRag = true;

  vectorStoreId = 'vs_68af29fb0da481919883202b65cdfe78';
  ragInstructions =
    "Du er en RAG-assistent. Du MÅ alltid bruke file_search før du svarer. " +
    "Hvis ingen relevante treff: svar 'Ingen treff i dokumentene.' og ikke gjett. Svar på norsk.";

  constructor(private api: ChatgptService, private zone: NgZone) {}

  ngOnInit() {
    if (this.isEmpty) this.startSuggestionLoop();  // only when empty
  }

  ngOnDestroy() {
    clearInterval(this.suggestionTimer);
  }

  ngAfterViewInit() {
    this.focusInput();
    this.scrollSoon();

    // Whenever the list of messages changes (new DOM nodes), scroll to bottom
    this.msgItems.changes.subscribe(() => this.scrollSoon());
  }

  private focusInput() {
    requestAnimationFrame(() => this.inputRef?.nativeElement?.focus());
  }

  private startSuggestionLoop() {
    this.suggestionTimer = setInterval(() => {
      // trigger a quick fade swap animation
      this.animateSwap = true;
      setTimeout(() => {
        this.suggestionIndex = (this.suggestionIndex + 1) % this.suggestions.length;
        this.currentSuggestion = this.suggestions[this.suggestionIndex];
        this.animateSwap = false;
      }, 180); // match CSS transition duration
    }, 2000); // change every 4s
  }

  applySuggestion() {
    this.userMessage = this.currentSuggestion;
    this.focusInput();
    this.onTextareaInput();
    // If you want to auto-send when clicking the suggestion:
  }

  // Force-scroll to bottom after DOM is stable
  private scrollSoon() {
    // Wait for Angular to finish rendering this tick
    this.zone.onStable.asObservable().pipe().subscribe({
      next: () => {
        const el = this.historyRef?.nativeElement;
        if (!el) return;
        // Use two rafs to be extra-safe after layout/paint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
          });
        });
      },
      complete: () => {},
    });
  }

  trackByIndex(i: number) { return i; }

  onTextareaInput() {
    const ta = this.inputRef?.nativeElement;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 240) + 'px';
  }

  onComposerKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !this.isSending) {
      e.preventDefault();
      this.send();
    }
  }

  private buildApiHistory(): HistoryMessage[] {
    return this.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  send() {
    const msg = this.userMessage.trim();
    if (!msg || this.isSending) return;
    this.stopSuggestionLoop();

    this.messages.push({ role: 'user', content: msg });
    this.userMessage = '';
    this.onTextareaInput();
    this.isSending = true;
    this.scrollSoon();

    const history = this.buildApiHistory();

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
      next: reply => {
        this.messages.push({ role: 'assistant', content: reply });
        this.isSending = false;
        this.scrollSoon();
        this.focusInput();
      },
      error: err => {
        const detail = err?.error?.error?.message || err?.message || 'API error';
        this.messages.push({ role: 'error', content: detail });
        this.isSending = false;
        this.scrollSoon();
        this.focusInput();
      },
    });
  }

  get isEmpty(): boolean { return this.messages.length === 0; }
  get isComposing(): boolean { return this.userMessage.trim().length > 0; }

  private stopSuggestionLoop() {
    if (this.suggestionTimer) {
      clearInterval(this.suggestionTimer);
      this.suggestionTimer = null;
    }
  }
}
