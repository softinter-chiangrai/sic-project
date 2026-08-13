import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';
import { StorageUploadReference } from '../component/sic-upload/sic-upload.component';

export type { StorageUploadReference };

export interface ChatMember {
  userId: string;
  displayName: string;
  isOnline: boolean;
  uploadGroupData: StorageUploadReference[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 0 | 1 | 2 | 3; // 0=text, 1=image, 2=file, 3=call
  attachmentId?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentFileSize?: number;
  attachmentContentType?: string;
  callAccepted?: boolean | null;
  callDurationSeconds?: number | null;
  sentAt: Date;
  isCancelled: boolean;
}

export interface ChatGroup {
  id: string;
  name: string;
  memberUserIds: string[];
}

export interface ChatGroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  message: string;
  messageType: 0 | 1 | 2 | 3;
  attachmentId?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentFileSize?: number;
  attachmentContentType?: string;
  callAccepted?: boolean | null;
  callDurationSeconds?: number | null;
  callParticipantUserIds?: string[] | null;
  sentAt: Date;
  isCancelled: boolean;
}

export interface IncomingCallInfo {
  callerId: string;
  callerName: string;
  callType: 'audio' | 'video';
  sdpOffer: string;
  groupId?: string;
  groupName?: string;
}

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected';

interface CallSignalPayload {
  action: 'start' | 'answer' | 'ice-candidate' | 'end' | 'recording';
  callerId?: string;
  callerName?: string;
  targetUserId?: string;
  callType?: 'audio' | 'video';
  sdpOffer?: string;
  sdpAnswer?: string;
  iceCandidate?: string;
  groupId?: string;
  groupName?: string;
  accepted?: boolean;
  isStarting?: boolean;
  durationSeconds?: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly notificationSvc = inject(NotificationService);

  private stompClient?: Client;
  private groupSubscriptions = new Map<string, StompSubscription>();

  // ── Observable streams ──
  readonly messageReceived$ = new Subject<ChatMessage>();
  readonly messageCancelled$ = new Subject<string>();
  readonly callLogUpdated$ = new Subject<ChatMessage>();
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
  private currentGroupCallId?: string;
  private callStartTime?: number;

  // ── Recording ──
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];
  readonly isRecording$ = new BehaviorSubject<boolean>(false);
  readonly isRecordingPaused$ = new BehaviorSubject<boolean>(false);
  readonly recordingNotification$ = new Subject<{ recorderId: string; isStarting: boolean }>();

  // ── Mic / Camera ──
  readonly isMicMuted$ = new BehaviorSubject<boolean>(false);
  readonly isCameraOff$ = new BehaviorSubject<boolean>(false);

  // ── Screen share ──
  private screenStream?: MediaStream;
  private originalVideoTrack?: MediaStreamTrack;
  readonly isScreenSharing$ = new BehaviorSubject<boolean>(false);

  // ── Group chat ──
  readonly groupMessageReceived$ = new Subject<ChatGroupMessage>();
  readonly groupMessageCancelled$ = new Subject<string>();
  readonly groupCallLogUpdated$ = new Subject<ChatGroupMessage>();
  readonly groupCreated$ = new Subject<ChatGroup>();
  readonly groupUpdated$ = new Subject<ChatGroup>();

  // ─────────────────────────────────────────────────────────────────────────
  // STOMP connection management
  // ─────────────────────────────────────────────────────────────────────────

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.stompClient?.active) return;

    const token = this.auth.getAccessToken() ?? '';
    const wsUrl = `${environment.apiBaseUrl.replace(/^http/, 'ws')}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}, // silent debug
    });

    this.stompClient.onConnect = () => {
      this.isConnected$.next(true);
      this.registerStompSubscriptions();
      this.notificationSvc.loadNotifications();
    };

    this.stompClient.onDisconnect = () => {
      this.isConnected$.next(false);
    };

    this.stompClient.onStompError = (frame) => {
      console.warn('[ChatService] STOMP Error:', frame.headers['message']);
      this.isConnected$.next(false);
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    this.groupSubscriptions.forEach(sub => sub.unsubscribe());
    this.groupSubscriptions.clear();
    this.stompClient?.deactivate();
    this.isConnected$.next(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Messaging
  // ─────────────────────────────────────────────────────────────────────────

  sendTextMessage(receiverUserId: string, text: string): void {
    this.publishStomp('/app/chat/private', {
      receiverId: receiverUserId,
      message: text,
      messageType: 'TEXT',
    });
  }

  sendImageMessage(receiverUserId: string, attachmentId: string, accessUrl: string): void {
    this.publishStomp('/app/chat/private', {
      receiverId: receiverUserId,
      message: accessUrl,
      messageType: 'IMAGE',
      attachmentId,
    });
  }

  sendFileMessage(receiverUserId: string, attachmentId: string): void {
    this.publishStomp('/app/chat/private', {
      receiverId: receiverUserId,
      message: '',
      messageType: 'FILE',
      attachmentId,
    });
  }

  cancelMessage(messageId: string): void {
    this.publishStomp('/app/chat/cancel', { messageId });
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
      this.http.get<any[]>(
        `${environment.apiBaseUrl}/api/su/chat/history/${encodeURIComponent(peerUserId)}`,
        { params: { page, pageSize: 50 } },
      ),
    ).then(msgs => msgs.map(m => this.toChatMessage(m)));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // File upload (session API)
  // ─────────────────────────────────────────────────────────────────────────

  async uploadChatFile(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<StorageUploadReference | null> {
    if (!isPlatformBrowser(this.platformId)) return null;

    const CHUNK_SIZE = 5 * 1024 * 1024;
    const category = file.type.startsWith('image/') ? 0 : 2;

    try {
      const session = await firstValueFrom(
        this.http.post<_UploadSession>(
          `${environment.apiBaseUrl}/api/storage/upload/sessions`,
          {
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type || 'application/octet-stream',
            category,
            visibility: 3,
            uploadGroupId: null,
            chunkSize: CHUNK_SIZE,
          },
        ),
      );

      let { sessionId, chunkSize, totalChunks, nextChunkIndex, uploadedBytes } = session;

      while (nextChunkIndex < totalChunks) {
        const start = nextChunkIndex * chunkSize;
        const chunk = file.slice(start, Math.min(file.size, start + chunkSize));
        const form = new FormData();
        form.append('chunk', chunk, `${file.name}.part-${nextChunkIndex}`);

        const state = await firstValueFrom(
          this.http.post<_UploadSession>(
            `${environment.apiBaseUrl}/api/storage/upload/sessions/${sessionId}/chunks/${nextChunkIndex}`,
            form,
          ),
        );

        nextChunkIndex = state.nextChunkIndex;
        uploadedBytes = state.uploadedBytes;
        onProgress?.(Math.min(99, Math.round((uploadedBytes / file.size) * 100)));
      }

      const result = await firstValueFrom(
        this.http.post<StorageUploadReference>(
          `${environment.apiBaseUrl}/api/storage/upload/sessions/${sessionId}/complete`,
          {},
        ),
      );

      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/api/storage/uploads/${result.id}/activate`, {}),
      );

      onProgress?.(100);
      return result;
    } catch (err) {
      console.error('[ChatService] uploadChatFile error:', err);
      return null;
    }
  }

  async uploadChatImage(file: File): Promise<StorageUploadReference | null> {
    return this.uploadChatFile(file);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Recording
  // ─────────────────────────────────────────────────────────────────────────

  startRecording(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const remote = this.remoteStream$.getValue();
    const local = this.localStream$.getValue();
    if (!remote) return;

    const tracks: MediaStreamTrack[] = [...remote.getTracks()];
    local?.getAudioTracks().forEach(t => { if (!tracks.includes(t)) tracks.push(t); });
    const combined = new MediaStream(tracks);
    const hasVideo = tracks.some(t => t.kind === 'video');

    const mimeTypes = hasVideo
      ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) ??
      (hasVideo ? 'video/webm' : 'audio/webm');

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(combined, { mimeType });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.start(1000);
    this.isRecording$.next(true);
    this.isRecordingPaused$.next(false);

    if (this.currentCallPeer) {
      this.publishStomp('/app/call/signal', {
        action: 'recording',
        targetUserId: this.currentCallPeer,
        isStarting: true,
      });
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this.isRecordingPaused$.next(true);
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this.isRecordingPaused$.next(false);
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.isRecording$.next(false);
      this.isRecordingPaused$.next(false);
      return;
    }
    const receiverId = this.currentCallPeer;
    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

    if (receiverId) {
      this.publishStomp('/app/call/signal', {
        action: 'recording',
        targetUserId: receiverId,
        isStarting: false,
      });
    }

    this.mediaRecorder.addEventListener('stop', async () => {
      const chunks = [...this.recordedChunks];
      this.recordedChunks = [];
      this.isRecording$.next(false);
      this.isRecordingPaused$.next(false);
      if (chunks.length === 0 || !receiverId) return;
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `recording_${Date.now()}.webm`, { type: mimeType });
      const result = await this.uploadChatFile(file);
      if (!result) return;
      if (this.currentGroupCallId) {
        this.sendGroupFileMessage(this.currentGroupCallId, result.id);
      } else {
        this.sendFileMessage(receiverId, result.id);
      }
    }, { once: true });

    this.mediaRecorder.stop();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Screen share
  // ─────────────────────────────────────────────────────────────────────────

  async startScreenShare(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const screen = await (navigator.mediaDevices as MediaDevices & {
        getDisplayMedia(c?: DisplayMediaStreamOptions): Promise<MediaStream>;
      }).getDisplayMedia({ video: true, audio: false });
      this.screenStream = screen;
      const screenTrack = screen.getVideoTracks()[0];

      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        this.originalVideoTrack = sender.track ?? undefined;
        await sender.replaceTrack(screenTrack);
      }

      const local = this.localStream$.getValue();
      if (local) {
        this.localStream$.next(new MediaStream([screenTrack, ...local.getAudioTracks()]));
      }

      this.isScreenSharing$.next(true);
      screenTrack.onended = () => this.stopScreenShare();
    } catch {
      // User cancelled
    }
  }

  stopScreenShare(): void {
    this.screenStream?.getTracks().forEach(t => t.stop());
    this.screenStream = undefined;

    if (this.originalVideoTrack) {
      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
      sender?.replaceTrack(this.originalVideoTrack).catch(console.error);
      const local = this.localStream$.getValue();
      if (local) {
        this.localStream$.next(new MediaStream([this.originalVideoTrack!, ...local.getAudioTracks()]));
      }
      this.originalVideoTrack = undefined;
    }
    this.isScreenSharing$.next(false);
  }

  toggleMic(): void {
    const stream = this.localStream$.getValue();
    if (!stream) return;
    const muted = !this.isMicMuted$.getValue();
    stream.getAudioTracks().forEach(t => { t.enabled = !muted; });
    this.isMicMuted$.next(muted);
  }

  toggleCamera(): void {
    const stream = this.localStream$.getValue();
    if (!stream) return;
    const off = !this.isCameraOff$.getValue();
    stream.getVideoTracks().forEach(t => { t.enabled = !off; });
    this.isCameraOff$.next(off);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Group chat
  // ─────────────────────────────────────────────────────────────────────────

  getGroups(): Promise<ChatGroup[]> {
    return firstValueFrom(
      this.http.get<ChatGroup[]>(`${environment.apiBaseUrl}/api/su/chat/groups`),
    ).then(groups => {
      groups.forEach(g => this.subscribeGroupTopic(g.id));
      return groups;
    });
  }

  getGroupHistory(groupId: string, page = 1): Promise<ChatGroupMessage[]> {
    return firstValueFrom(
      this.http.get<any[]>(
        `${environment.apiBaseUrl}/api/su/chat/group/${encodeURIComponent(groupId)}/history`,
        { params: { page, pageSize: 50 } },
      ),
    ).then(msgs => msgs.map(m => this.toGroupMessage(m)));
  }

  createGroup(name: string, memberUserIds: string[]): void {
    firstValueFrom(
      this.http.post<ChatGroup>(`${environment.apiBaseUrl}/api/su/chat/group/create`, { name, memberUserIds }),
    ).then(group => {
      this.subscribeGroupTopic(group.id);
      this.groupCreated$.next(group);
    }).catch(console.error);
  }

  async startGroupCallHub(groupId: string, callType: 'audio' | 'video'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentCallPeer = groupId;
    this.currentGroupCallId = groupId;
    this.callStartTime = Date.now();
    this.callStatus$.next('calling');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    this.localStream$.next(stream);

    this.peerConnection = this.buildPeerConnection(groupId);
    stream.getTracks().forEach(t => this.peerConnection!.addTrack(t, stream));

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.publishStomp('/app/call/signal', {
      action: 'start',
      groupId,
      callType,
      sdpOffer: JSON.stringify(offer),
    });
  }

  updateGroup(groupId: string, name: string, memberUserIds: string[]): void {
    // REST update fallback if needed
  }

  sendGroupTextMessage(groupId: string, text: string): void {
    this.subscribeGroupTopic(groupId);
    this.publishStomp('/app/chat/group', {
      groupId,
      message: text,
      messageType: 'TEXT',
    });
  }

  sendGroupImageMessage(groupId: string, attachmentId: string, accessUrl: string): void {
    this.subscribeGroupTopic(groupId);
    this.publishStomp('/app/chat/group', {
      groupId,
      message: accessUrl,
      messageType: 'IMAGE',
      attachmentId,
    });
  }

  sendGroupFileMessage(groupId: string, attachmentId: string): void {
    this.subscribeGroupTopic(groupId);
    this.publishStomp('/app/chat/group', {
      groupId,
      message: '',
      messageType: 'FILE',
      attachmentId,
    });
  }

  cancelGroupMessage(messageId: string): void {
    this.publishStomp('/app/chat/cancel', { messageId });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WebRTC Call
  // ─────────────────────────────────────────────────────────────────────────

  async startCall(peerUserId: string, callType: 'audio' | 'video'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentCallPeer = peerUserId;
    this.callStartTime = Date.now();
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

    this.publishStomp('/app/call/signal', {
      action: 'start',
      targetUserId: peerUserId,
      callType,
      sdpOffer: JSON.stringify(offer),
    });
  }

  async answerCall(callerId: string, sdpOffer: string, callType: 'audio' | 'video', accept: boolean, groupId?: string): Promise<void> {
    if (!accept) {
      this.publishStomp('/app/call/signal', {
        action: 'answer',
        targetUserId: callerId,
        accepted: false,
        groupId,
      });
      this.callStatus$.next('idle');
      return;
    }

    this.currentCallPeer = callerId;
    this.callStartTime = Date.now();
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

    this.publishStomp('/app/call/signal', {
      action: 'answer',
      targetUserId: callerId,
      sdpAnswer: JSON.stringify(answer),
      accepted: true,
      groupId,
    });
  }

  endCall(): void {
    if (this.currentCallPeer) {
      const durationSeconds = this.callStartTime ? Math.round((Date.now() - this.callStartTime) / 1000) : 0;
      this.publishStomp('/app/call/signal', {
        action: 'end',
        targetUserId: this.currentCallPeer,
        durationSeconds,
        accepted: true,
      });
    }
    this.cleanupCall();
  }

  endGroupCall(groupId: string): void {
    this.publishStomp('/app/call/signal', {
      action: 'end',
      groupId,
    });
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
  // Internal Helpers & Subscriptions
  // ─────────────────────────────────────────────────────────────────────────

  private publishStomp(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }

  private registerStompSubscriptions(): void {
    if (!this.stompClient) return;

    // 1. Private messages
    this.stompClient.subscribe('/user/queue/messages', (msg) => {
      try {
        const data = JSON.parse(msg.body);
        this.messageReceived$.next(this.toChatMessage(data));
      } catch (err) {
        console.error('[ChatService] Error parsing private message:', err);
      }
    });

    // 2. Message cancellation
    this.stompClient.subscribe('/user/queue/messages/cancel', (msg) => {
      try {
        const data = JSON.parse(msg.body);
        if (data.messageId) this.messageCancelled$.next(data.messageId);
      } catch (err) {
        console.error('[ChatService] Error parsing cancelled message:', err);
      }
    });

    // 3. WebRTC signaling channel
    this.stompClient.subscribe('/user/queue/call', (msg) => {
      try {
        const payload: CallSignalPayload = JSON.parse(msg.body);
        this.handleCallSignalPayload(payload);
      } catch (err) {
        console.error('[ChatService] Error parsing call signal:', err);
      }
    });

    // 4. Notifications
    this.stompClient.subscribe('/user/queue/notifications', (msg) => {
      try {
        const notification = JSON.parse(msg.body);
        this.notificationSvc.handleIncomingNotification(notification);
      } catch (err) {
        console.error('[ChatService] Error parsing notification:', err);
      }
    });
  }

  private subscribeGroupTopic(groupId: string): void {
    if (!this.stompClient?.connected || this.groupSubscriptions.has(groupId)) return;
    const sub = this.stompClient.subscribe(`/topic/group/${groupId}`, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        this.groupMessageReceived$.next(this.toGroupMessage(data));
      } catch (err) {
        console.error('[ChatService] Error parsing group message:', err);
      }
    });
    this.groupSubscriptions.set(groupId, sub);
  }

  private handleCallSignalPayload(payload: CallSignalPayload): void {
    switch (payload.action) {
      case 'start':
        this.callStatus$.next('incoming');
        this.incomingCall$.next({
          callerId: payload.callerId || '',
          callerName: payload.callerName || '',
          callType: payload.callType || 'audio',
          sdpOffer: payload.sdpOffer || '',
          groupId: payload.groupId,
          groupName: payload.groupName,
        });
        break;
      case 'answer':
        this.callAnswered$.next({
          sdpAnswer: payload.sdpAnswer || '',
          accepted: Boolean(payload.accepted),
        });
        if (payload.accepted && payload.sdpAnswer) {
          this.callStatus$.next('connected');
          this.peerConnection?.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(payload.sdpAnswer)),
          );
        } else {
          this.cleanupCall();
        }
        break;
      case 'ice-candidate':
        if (payload.iceCandidate) {
          this.peerConnection?.addIceCandidate(
            new RTCIceCandidate(JSON.parse(payload.iceCandidate)),
          );
          this.iceCandidate$.next(payload.iceCandidate);
        }
        break;
      case 'end':
        this.callEnded$.next();
        this.cleanupCall();
        break;
      case 'recording':
        this.recordingNotification$.next({
          recorderId: payload.callerId || '',
          isStarting: Boolean(payload.isStarting),
        });
        break;
    }
  }

  private buildPeerConnection(peerUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    pc.onicecandidate = ev => {
      if (ev.candidate) {
        this.publishStomp('/app/call/signal', {
          action: 'ice-candidate',
          targetUserId: peerUserId,
          iceCandidate: JSON.stringify(ev.candidate),
        });
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
    this.stopRecording();
    this.stopScreenShare();
    this.peerConnection?.close();
    this.peerConnection = undefined;
    this.localStream$.getValue()?.getTracks().forEach(t => t.stop());
    this.localStream$.next(null);
    this.remoteStream$.next(null);
    this.callStatus$.next('idle');
    this.currentCallPeer = undefined;
    this.currentGroupCallId = undefined;
    this.callStartTime = undefined;
    this.isMicMuted$.next(false);
    this.isCameraOff$.next(false);
  }

  private toChatMessage(data: any): ChatMessage {
    const typeMap: Record<string, 0 | 1 | 2 | 3> = {
      TEXT: 0,
      IMAGE: 1,
      FILE: 2,
      CALL: 3,
      VIDEO: 3,
      AUDIO: 3,
    };
    const messageType = typeof data.messageType === 'number'
      ? (data.messageType as 0 | 1 | 2 | 3)
      : (typeMap[data.messageType] ?? 0);

    return {
      id: data.id,
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message || '',
      messageType,
      attachmentId: data.attachmentId,
      callAccepted: data.callAccepted,
      callDurationSeconds: data.callDurationSeconds,
      sentAt: data.createdDate ? new Date(data.createdDate) : new Date(),
      isCancelled: Boolean(data.isCancelled),
    };
  }

  private toGroupMessage(data: any): ChatGroupMessage {
    const typeMap: Record<string, 0 | 1 | 2 | 3> = {
      TEXT: 0,
      IMAGE: 1,
      FILE: 2,
      CALL: 3,
      VIDEO: 3,
      AUDIO: 3,
    };
    const messageType = typeof data.messageType === 'number'
      ? (data.messageType as 0 | 1 | 2 | 3)
      : (typeMap[data.messageType] ?? 0);

    return {
      id: data.id,
      groupId: data.groupId,
      senderId: data.senderId,
      message: data.message || '',
      messageType,
      attachmentId: data.attachmentId,
      sentAt: data.createdDate ? new Date(data.createdDate) : new Date(),
      isCancelled: Boolean(data.isCancelled),
    };
  }
}

interface _UploadSession {
  sessionId: string;
  chunkSize: number;
  totalChunks: number;
  nextChunkIndex: number;
  uploadedBytes: number;
}
