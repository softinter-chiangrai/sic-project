import {
  Component,
  Directive,
  ElementRef,
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
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { ChatService, ChatMember, ChatMessage, ChatGroup, ChatGroupMessage, IncomingCallInfo, StorageUploadReference } from '../../services/chat.service';

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
  peerAvatarUrl: string | null;
  isOnline: boolean;
  messages: ChatMessage[];
  inputText: string;
  unreadCount: number;
  isLoading: boolean;
}

interface OpenGroupChat {
  groupId: string;
  groupName: string;
  memberUserIds: string[];
  messages: ChatGroupMessage[];
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
  private readonly http = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();

  // ── UI state ──
  readonly showPanel = signal(false);
  readonly openChats = signal<OpenChat[]>([]);
  readonly openGroupChats = signal<OpenGroupChat[]>([]);
  readonly members = signal<ChatMember[]>([]);
  readonly groups = signal<ChatGroup[]>([]);
  readonly incomingCall = signal<IncomingCallInfo | null>(null);

  // ── Create group dialog ──
  readonly showCreateGroup = signal(false);
  newGroupName = '';
  readonly selectedGroupMembers = signal<Set<string>>(new Set());

  // ── Call state from service ──
  readonly callStatus = toSignal(this.chatSvc.callStatus$, { initialValue: 'idle' as const });
  readonly localStream = toSignal(this.chatSvc.localStream$, { initialValue: null });
  readonly remoteStream = toSignal(this.chatSvc.remoteStream$, { initialValue: null });

  // ── Recording / screen-share state ──
  readonly isRecording = toSignal(this.chatSvc.isRecording$, { initialValue: false });
  readonly isRecordingPaused = toSignal(this.chatSvc.isRecordingPaused$, { initialValue: false });
  readonly isScreenSharing = toSignal(this.chatSvc.isScreenSharing$, { initialValue: false });

  // ── Mic / Camera state ──
  readonly isMicMuted = toSignal(this.chatSvc.isMicMuted$, { initialValue: false });
  readonly isCameraOff = toSignal(this.chatSvc.isCameraOff$, { initialValue: false });

  // ── Peer recording alert ──
  readonly peerIsRecording = signal(false);

  readonly totalUnread = computed(() =>
    this.openChats().reduce((s, c) => s + c.unreadCount, 0) +
    this.openGroupChats().reduce((s, c) => s + c.unreadCount, 0)
  );
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
    this.loadGroups();
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
      peerAvatarUrl: this.profileUrl(member.uploadGroupData),
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

  async attachFile(chat: OpenChat, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const result = await this.chatSvc.uploadChatFile(file);
    if (result) {
      if (file.type.startsWith('image/')) {
        this.chatSvc.sendImageMessage(chat.peerId, result.id, result.accessUrl);
      } else {
        this.chatSvc.sendFileMessage(chat.peerId, result.id);
      }
    }
    input.value = '';
  }

  canCancel(msg: ChatMessage): boolean {
    return (
      msg.messageType !== 3 &&
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

  startRecording(): void {
    this.chatSvc.startRecording();
  }

  pauseRecording(): void {
    this.chatSvc.pauseRecording();
  }

  resumeRecording(): void {
    this.chatSvc.resumeRecording();
  }

  stopRecording(): void {
    this.chatSvc.stopRecording();
  }

  async toggleScreenShare(): Promise<void> {
    if (this.isScreenSharing()) {
      this.chatSvc.stopScreenShare();
    } else {
      await this.chatSvc.startScreenShare();
    }
  }

  toggleMic(): void {
    this.chatSvc.toggleMic();
  }

  toggleCamera(): void {
    this.chatSvc.toggleCamera();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Group chat
  // ─────────────────────────────────────────────────────────────────────────

  openCreateGroupDialog(): void {
    this.newGroupName = '';
    this.selectedGroupMembers.set(new Set());
    this.showCreateGroup.set(true);
  }

  closeCreateGroupDialog(): void {
    this.showCreateGroup.set(false);
  }

  toggleGroupMember(userId: string): void {
    this.selectedGroupMembers.update(set => {
      const next = new Set(set);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  confirmCreateGroup(): void {
    const name = this.newGroupName.trim();
    if (!name || this.selectedGroupMembers().size === 0) return;
    this.chatSvc.createGroup(name, [...this.selectedGroupMembers()]);
    this.showCreateGroup.set(false);
  }

  openGroupChat(group: ChatGroup): void {
    this.showPanel.set(false);
    const existing = this.openGroupChats().find(c => c.groupId === group.id);
    if (existing) return;

    const allChats = [...this.openChats(), ...this.openGroupChats()];
    if (allChats.length >= 3) {
      if (this.openGroupChats().length > 0) {
        this.openGroupChats.update(cs => cs.slice(1));
      } else {
        this.openChats.update(cs => cs.slice(1));
      }
    }

    const newChat: OpenGroupChat = {
      groupId: group.id,
      groupName: group.name,
      memberUserIds: group.memberUserIds,
      messages: [],
      inputText: '',
      unreadCount: 0,
      isLoading: true,
    };
    this.openGroupChats.update(cs => [...cs, newChat]);
    this.loadGroupHistory(group.id);
  }

  closeGroupChat(groupId: string): void {
    this.openGroupChats.update(cs => cs.filter(c => c.groupId !== groupId));
  }

  sendGroupMessage(chat: OpenGroupChat): void {
    const text = chat.inputText.trim();
    if (!text) return;
    this.chatSvc.sendGroupTextMessage(chat.groupId, text);
    chat.inputText = '';
  }

  onGroupEnter(event: Event, chat: OpenGroupChat): void {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    event.preventDefault();
    this.sendGroupMessage(chat);
  }

  async attachGroupFile(chat: OpenGroupChat, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const result = await this.chatSvc.uploadChatFile(file);
    if (result) {
      if (file.type.startsWith('image/')) {
        this.chatSvc.sendGroupImageMessage(chat.groupId, result.id, result.accessUrl);
      } else {
        this.chatSvc.sendGroupFileMessage(chat.groupId, result.id);
      }
    }
    input.value = '';
  }

  canCancelGroup(msg: ChatGroupMessage): boolean {
    return (
      msg.senderId === this.currentUserId() &&
      !msg.isCancelled &&
      Date.now() - msg.sentAt.getTime() < 2 * 60 * 1000
    );
  }

  cancelGroupMessage(msg: ChatGroupMessage): void {
    this.chatSvc.cancelGroupMessage(msg.id);
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

  formatCallDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async downloadFile(url: string | undefined, fileName: string | undefined): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !url) return;
    try {
      const blob = await firstValueFrom(this.http.get(url, { responseType: 'blob' }));
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName || 'download';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('[Headchat] downloadFile error:', err);
    }
  }

  chatWindowRight(index: number): number {
    return 80 + index * 320;
  }

  profileUrl(uploads: StorageUploadReference[] | undefined | null): string | null {
    return uploads?.find(u => u.isActive)?.accessUrl ?? null;
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

  private loadGroups(): void {
    this.chatSvc.getGroups()
      .then(list => this.groups.set(list))
      .catch(console.error);
  }

  private loadGroupHistory(groupId: string): void {
    this.chatSvc.getGroupHistory(groupId)
      .then(msgs => {
        this.openGroupChats.update(cs =>
          cs.map(c => c.groupId === groupId ? { ...c, messages: msgs, isLoading: false } : c),
        );
      })
      .catch(() => {
        this.openGroupChats.update(cs =>
          cs.map(c => c.groupId === groupId ? { ...c, isLoading: false } : c),
        );
      });
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
        } else if (msg.senderId !== this.currentUserId() && msg.messageType !== 3) {
          // Auto-open window for new incoming message (skip call log entries)
          const sender = this.members().find(m => m.userId === msg.senderId);
          const newChat: OpenChat = {
            peerId: msg.senderId,
            peerName: sender?.displayName ?? msg.senderId,
            peerAvatarUrl: sender ? this.profileUrl(sender.uploadGroupData) : null,
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

    this.chatSvc.callLogUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        this.openChats.update(cs =>
          cs.map(c => ({
            ...c,
            messages: c.messages.map(m => m.id === msg.id ? { ...m, ...msg } : m),
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
      .subscribe(() => {
        this.currentCallPeer.set(null);
        this.peerIsRecording.set(false);
      });

    this.chatSvc.recordingNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isStarting }) => this.peerIsRecording.set(isStarting));

    this.chatSvc.groupCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(group => {
        this.groups.update(gs => {
          if (gs.some(g => g.id === group.id)) return gs;
          return [...gs, group];
        });
      });

    this.chatSvc.groupMessageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        const open = this.openGroupChats().find(c => c.groupId === msg.groupId);
        if (open) {
          this.openGroupChats.update(cs =>
            cs.map(c =>
              c.groupId === msg.groupId
                ? {
                    ...c,
                    messages: [...c.messages, msg],
                    unreadCount: msg.senderId !== this.currentUserId() ? c.unreadCount + 1 : c.unreadCount,
                  }
                : c,
            ),
          );
        } else if (msg.senderId !== this.currentUserId()) {
          const group = this.groups().find(g => g.id === msg.groupId);
          const newChat: OpenGroupChat = {
            groupId: msg.groupId,
            groupName: group?.name ?? 'Group',
            memberUserIds: group?.memberUserIds ?? [],
            messages: [msg],
            inputText: '',
            unreadCount: 1,
            isLoading: false,
          };
          const allChats = [...this.openChats(), ...this.openGroupChats()];
          if (allChats.length >= 3) {
            this.openGroupChats.update(cs => cs.length > 0 ? [...cs.slice(1), newChat] : cs);
          } else {
            this.openGroupChats.update(cs => [...cs, newChat]);
          }
        }
      });

    this.chatSvc.groupMessageCancelled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.openGroupChats.update(cs =>
          cs.map(c => ({
            ...c,
            messages: c.messages.map(m => m.id === id ? { ...m, isCancelled: true } : m),
          })),
        );
      });
  }
}
