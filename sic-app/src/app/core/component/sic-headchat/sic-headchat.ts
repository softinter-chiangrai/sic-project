import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/auth.service';
import { ChatService, ChatMember, ChatMessage, IncomingCallInfo } from '../../services/chat.service';

// ── Directive: bind MediaStream to <video>.srcObject ──────────────────────
@Directive({ selector: '[sicStream]', standalone: true })
export class SicStreamDirective {
  private readonly el = inject<ElementRef<HTMLVideoElement>>(ElementRef);

  @Input() set sicStream(stream: MediaStream | null) {
    this.el.nativeElement.srcObject = stream;
  }
}

// ── Open-chat window state ─────────────────────────────────────────────────
interface OpenChat {
  peerId: string;
  peerName: string;
  isOnline: boolean;
  messages: ChatMessage[];
  inputText: string;
  unreadCount: number;
  isLoading: boolean;
}

@Component({
  selector: 'sic-headchat',
  standalone: true,
  imports: [CommonModule, FormsModule, SicStreamDirective],
  templateUrl: './sic-headchat.html',
  styleUrl: './sic-headchat.css',
})
export class SicHeadchat implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly chatSvc = inject(ChatService);
  private readonly destroy$ = new Subject<void>();

  // ── UI state ──
  readonly showPanel = signal(false);
  readonly openChats = signal<OpenChat[]>([]);
  readonly members = signal<ChatMember[]>([]);
  readonly incomingCall = signal<IncomingCallInfo | null>(null);

  // ── Call state from service ──
  readonly callStatus = toSignal(this.chatSvc.callStatus$, { initialValue: 'idle' as const });
  readonly localStream = toSignal(this.chatSvc.localStream$, { initialValue: null });
  readonly remoteStream = toSignal(this.chatSvc.remoteStream$, { initialValue: null });

  readonly totalUnread = computed(() => this.openChats().reduce((s, c) => s + c.unreadCount, 0));
  readonly currentUserId = signal<string | null>(null);

  // ── Current call info ──
  currentCallPeer = signal<string | null>(null);
  currentCallType = signal<'audio' | 'video'>('audio');

  @ViewChild('messageContainer') messageContainer?: ElementRef<HTMLElement>;

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.auth.isLoggedIn()) return;

    this.currentUserId.set(this.chatSvc.getCurrentUserId());
    this.chatSvc.connect();
    this.loadMembers();
    this.subscribeToEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatSvc.disconnect();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Panel / member list
  // ─────────────────────────────────────────────────────────────────────────

  togglePanel(): void {
    this.showPanel.update(v => !v);
  }

  openChatWith(member: ChatMember): void {
    this.showPanel.set(false);
    const existing = this.openChats().find(c => c.peerId === member.userId);
    if (existing) return;

    // max 3 simultaneous windows
    const chats = this.openChats();
    if (chats.length >= 3) {
      this.openChats.update(cs => cs.slice(1));
    }

    const newChat: OpenChat = {
      peerId: member.userId,
      peerName: member.displayName,
      isOnline: member.isOnline,
      messages: [],
      inputText: '',
      unreadCount: 0,
      isLoading: true,
    };
    this.openChats.update(cs => [...cs, newChat]);
    this.loadHistory(member.userId);
  }

  closeChat(peerId: string): void {
    this.openChats.update(cs => cs.filter(c => c.peerId !== peerId));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Messaging
  // ─────────────────────────────────────────────────────────────────────────

  sendMessage(chat: OpenChat): void {
    const text = chat.inputText.trim();
    if (!text) return;
    this.chatSvc.sendTextMessage(chat.peerId, text);
    chat.inputText = '';
  }

  onEnter(event: Event, chat: OpenChat): void {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    event.preventDefault();
    this.sendMessage(chat);
  }

  async uploadImage(chat: OpenChat, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const result = await this.chatSvc.uploadChatImage(file);
    if (result) {
      this.chatSvc.sendImageMessage(chat.peerId, result.id, result.accessUrl);
    }
    input.value = '';
  }

  canCancel(msg: ChatMessage): boolean {
    return (
      msg.senderId === this.currentUserId() &&
      !msg.isCancelled &&
      Date.now() - msg.sentAt.getTime() < 2 * 60 * 1000
    );
  }

  cancelMessage(msg: ChatMessage): void {
    this.chatSvc.cancelMessage(msg.id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Calls
  // ─────────────────────────────────────────────────────────────────────────

  async startCall(peerId: string, callType: 'audio' | 'video'): Promise<void> {
    this.currentCallPeer.set(peerId);
    this.currentCallType.set(callType);
    await this.chatSvc.startCall(peerId, callType);
  }

  async acceptCall(): Promise<void> {
    const info = this.incomingCall();
    if (!info) return;
    this.currentCallPeer.set(info.callerId);
    this.currentCallType.set(info.callType);
    this.incomingCall.set(null);
    await this.chatSvc.answerCall(info.callerId, info.sdpOffer, info.callType, true);
  }

  rejectCall(): void {
    const info = this.incomingCall();
    if (!info) return;
    this.incomingCall.set(null);
    this.chatSvc.answerCall(info.callerId, '', info.callType, false);
  }

  endCall(): void {
    this.chatSvc.endCall();
    this.currentCallPeer.set(null);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Template helpers
  // ─────────────────────────────────────────────────────────────────────────

  trackChat(_: number, chat: OpenChat): string {
    return chat.peerId;
  }

  trackMsg(_: number, msg: ChatMessage): string {
    return msg.id;
  }

  chatWindowRight(index: number): number {
    return 80 + index * 320;
  }

  callerName(): string {
    const info = this.incomingCall();
    return info?.callerName ?? '';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Data loaders
  // ─────────────────────────────────────────────────────────────────────────

  private loadMembers(): void {
    this.chatSvc.getMembers()
      .then(list => this.members.set(list))
      .catch(console.error);
  }

  private loadHistory(peerUserId: string): void {
    this.chatSvc.getChatHistory(peerUserId)
      .then(msgs => {
        this.openChats.update(cs =>
          cs.map(c =>
            c.peerId === peerUserId
              ? { ...c, messages: msgs.reverse(), isLoading: false }
              : c,
          ),
        );
      })
      .catch(() => {
        this.openChats.update(cs =>
          cs.map(c => c.peerId === peerUserId ? { ...c, isLoading: false } : c),
        );
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event subscriptions
  // ─────────────────────────────────────────────────────────────────────────

  private subscribeToEvents(): void {
    this.chatSvc.messageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        const peerId = msg.senderId === this.currentUserId() ? msg.receiverId : msg.senderId;
        const open = this.openChats().find(c => c.peerId === peerId);
        if (open) {
          this.openChats.update(cs =>
            cs.map(c =>
              c.peerId === peerId
                ? {
                    ...c,
                    messages: [...c.messages, msg],
                    unreadCount: msg.senderId !== this.currentUserId() ? c.unreadCount + 1 : c.unreadCount,
                  }
                : c,
            ),
          );
        } else if (msg.senderId !== this.currentUserId()) {
          // Auto-open window for new incoming message
          const sender = this.members().find(m => m.userId === msg.senderId);
          const newChat: OpenChat = {
            peerId: msg.senderId,
            peerName: sender?.displayName ?? msg.senderId,
            isOnline: true,
            messages: [msg],
            inputText: '',
            unreadCount: 1,
            isLoading: false,
          };
          const chats = this.openChats();
          if (chats.length >= 3) {
            this.openChats.update(cs => [...cs.slice(1), newChat]);
          } else {
            this.openChats.update(cs => [...cs, newChat]);
          }
        }
      });

    this.chatSvc.messageCancelled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.openChats.update(cs =>
          cs.map(c => ({
            ...c,
            messages: c.messages.map(m => m.id === id ? { ...m, isCancelled: true } : m),
          })),
        );
      });

    this.chatSvc.userStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId, isOnline }) => {
        this.members.update(ms =>
          ms.map(m => m.userId === userId ? { ...m, isOnline } : m),
        );
        this.openChats.update(cs =>
          cs.map(c => c.peerId === userId ? { ...c, isOnline } : c),
        );
      });

    this.chatSvc.incomingCall$
      .pipe(takeUntil(this.destroy$))
      .subscribe(info => this.incomingCall.set(info));

    this.chatSvc.callEnded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.currentCallPeer.set(null));
  }
}
