import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface ChatMember {
  userId: string;
  displayName: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 0 | 1 | 2; // 0=text, 1=image, 2=file
  attachmentId?: string;
  attachmentUrl?: string;
  sentAt: Date;
  isCancelled: boolean;
}

export interface IncomingCallInfo {
  callerId: string;
  callerName: string;
  callType: 'audio' | 'video';
  sdpOffer: string;
}

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  private connection?: signalR.HubConnection;

  // ── Observable streams ──
  readonly messageReceived$ = new Subject<ChatMessage>();
  readonly messageCancelled$ = new Subject<string>();
  readonly userStatusChanged$ = new Subject<{ userId: string; isOnline: boolean }>();
  readonly incomingCall$ = new Subject<IncomingCallInfo>();
  readonly callAnswered$ = new Subject<{ sdpAnswer: string; accepted: boolean }>();
  readonly callRejected$ = new Subject<void>();
  readonly callEnded$ = new Subject<void>();
  readonly iceCandidate$ = new Subject<string>();
  readonly isConnected$ = new BehaviorSubject<boolean>(false);

  // ── WebRTC ──
  readonly callStatus$ = new BehaviorSubject<CallStatus>('idle');
  readonly localStream$ = new BehaviorSubject<MediaStream | null>(null);
  readonly remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  private peerConnection?: RTCPeerConnection;
  private currentCallPeer?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // SignalR connection management
  // ─────────────────────────────────────────────────────────────────────────

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl}/hubs/chat`, {
        accessTokenFactory: () => this.auth.getAccessToken() ?? '',
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.registerHandlers();

    this.connection
      .start()
      .then(() => this.isConnected$.next(true))
      .catch(err => console.warn('[ChatService] Hub connection error:', err));
  }

  disconnect(): void {
    this.connection?.stop();
    this.isConnected$.next(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Messaging
  // ─────────────────────────────────────────────────────────────────────────

  sendTextMessage(receiverUserId: string, text: string): void {
    this.connection?.invoke('SendMessage', receiverUserId, text, 0, null).catch(console.error);
  }

  sendImageMessage(receiverUserId: string, attachmentId: string, accessUrl: string): void {
    this.connection?.invoke('SendMessage', receiverUserId, accessUrl, 1, attachmentId).catch(console.error);
  }

  cancelMessage(messageId: string): void {
    this.connection?.invoke('CancelMessage', messageId).catch(console.error);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REST helpers
  // ─────────────────────────────────────────────────────────────────────────

  getMembers(): Promise<ChatMember[]> {
    return firstValueFrom(
      this.http.get<ChatMember[]>(`${environment.apiBaseUrl}/api/su/chat/members`),
    );
  }

  getChatHistory(peerUserId: string, page = 1): Promise<ChatMessage[]> {
    return firstValueFrom(
      this.http.get<ChatMessage[]>(
        `${environment.apiBaseUrl}/api/su/chat/history/${encodeURIComponent(peerUserId)}`,
        { params: { page, pageSize: 50 } },
      ),
    ).then(msgs => msgs.map(m => ({ ...m, sentAt: new Date(m.sentAt) })));
  }

  async uploadChatImage(file: File): Promise<{ id: string; accessUrl: string } | null> {
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string; accessUrl: string }>(
          `${environment.apiBaseUrl}/api/storage/upload/image`,
          form,
        ),
      );
      // activate the upload so it's publicly accessible
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/api/storage/uploads/${res.id}/activate`, {}),
      );
      return res;
    } catch {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WebRTC
  // ─────────────────────────────────────────────────────────────────────────

  async startCall(peerUserId: string, callType: 'audio' | 'video'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentCallPeer = peerUserId;
    this.callStatus$.next('calling');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    this.localStream$.next(stream);

    this.peerConnection = this.buildPeerConnection(peerUserId);
    stream.getTracks().forEach(t => this.peerConnection!.addTrack(t, stream));

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.connection?.invoke('StartCall', peerUserId, callType, JSON.stringify(offer)).catch(console.error);
  }

  async answerCall(callerId: string, sdpOffer: string, callType: 'audio' | 'video', accept: boolean): Promise<void> {
    if (!accept) {
      this.connection?.invoke('AnswerCall', callerId, '', false).catch(console.error);
      this.callStatus$.next('idle');
      return;
    }

    this.currentCallPeer = callerId;
    this.callStatus$.next('connected');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    this.localStream$.next(stream);

    this.peerConnection = this.buildPeerConnection(callerId);
    stream.getTracks().forEach(t => this.peerConnection!.addTrack(t, stream));

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(sdpOffer)));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.connection?.invoke('AnswerCall', callerId, JSON.stringify(answer), true).catch(console.error);
  }

  endCall(): void {
    if (this.currentCallPeer) {
      this.connection?.invoke('EndCall', this.currentCallPeer).catch(console.error);
    }
    this.cleanupCall();
  }

  getCurrentUserId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = this.auth.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { sub?: string };
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────────────────────

  private buildPeerConnection(peerUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    pc.onicecandidate = ev => {
      if (ev.candidate) {
        this.connection?.invoke('SendIceCandidate', peerUserId, JSON.stringify(ev.candidate)).catch(console.error);
      }
    };

    pc.ontrack = ev => {
      this.remoteStream$.next(ev.streams[0] ?? null);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.callStatus$.next('connected');
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        this.cleanupCall();
      }
    };

    return pc;
  }

  private cleanupCall(): void {
    this.peerConnection?.close();
    this.peerConnection = undefined;
    this.localStream$.getValue()?.getTracks().forEach(t => t.stop());
    this.localStream$.next(null);
    this.remoteStream$.next(null);
    this.callStatus$.next('idle');
    this.currentCallPeer = undefined;
  }

  private registerHandlers(): void {
    if (!this.connection) return;

    this.connection.on('ReceiveMessage', (msg: ChatMessage) => {
      msg.sentAt = new Date(msg.sentAt);
      this.messageReceived$.next(msg);
    });

    this.connection.on('MessageCancelled', (id: string) => {
      this.messageCancelled$.next(id);
    });

    this.connection.on('UserStatusChanged', (userId: string, isOnline: boolean) => {
      this.userStatusChanged$.next({ userId, isOnline });
    });

    this.connection.on('IncomingCall', (callerId: string, callerName: string, callType: 'audio' | 'video', sdpOffer: string) => {
      this.callStatus$.next('incoming');
      this.incomingCall$.next({ callerId, callerName, callType, sdpOffer });
    });

    this.connection.on('CallAnswered', (sdpAnswer: string, accepted: boolean) => {
      this.callAnswered$.next({ sdpAnswer, accepted });
      if (accepted) {
        this.callStatus$.next('connected');
        this.peerConnection?.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(sdpAnswer) as RTCSessionDescriptionInit),
        );
      } else {
        this.cleanupCall();
      }
    });

    this.connection.on('CallRejected', () => {
      this.callRejected$.next();
      this.cleanupCall();
    });

    this.connection.on('IceCandidate', async (candidateJson: string) => {
      await this.peerConnection?.addIceCandidate(
        new RTCIceCandidate(JSON.parse(candidateJson) as RTCIceCandidateInit),
      );
    });

    this.connection.on('CallEnded', () => {
      this.callEnded$.next();
      this.cleanupCall();
    });

    this.connection.onreconnected(() => this.isConnected$.next(true));
    this.connection.onreconnecting(() => this.isConnected$.next(false));
    this.connection.onclose(() => this.isConnected$.next(false));
  }
}
