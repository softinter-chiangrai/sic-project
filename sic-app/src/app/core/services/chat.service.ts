import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth/auth.service';
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

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  private connection?: signalR.HubConnection;

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

  sendFileMessage(receiverUserId: string, attachmentId: string): void {
    this.connection?.invoke('SendMessage', receiverUserId, '', 2, attachmentId).catch(console.error);
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

  // ─────────────────────────────────────────────────────────────────────────
  // File upload  (same session API as sic-upload)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Upload a file using the same resumable session API as sic-upload.
   * Steps: create session → upload chunks → complete → activate.
   * Returns a StorageUploadReference on success, null on failure.
   * @param onProgress optional callback with 0–100 percent value
   */
  async uploadChatFile(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<StorageUploadReference | null> {
    if (!isPlatformBrowser(this.platformId)) return null;

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk

    // Map file type → storage category.
    // Audio and video are stored as raw files (category=2/document) to avoid
    // HLS transcoding, so the browser can play them directly with <audio>/<video>.
    const category = file.type.startsWith('image/') ? 0 : 2;

    try {
      // 1. Create upload session
      const session = await firstValueFrom(
        this.http.post<_UploadSession>(
          `${environment.apiBaseUrl}/api/storage/upload/sessions`,
          {
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type || 'application/octet-stream',
            category,
            visibility: 3, // AnyoneWithLink — receiver must be able to download
            uploadGroupId: null,
            chunkSize: CHUNK_SIZE,
          },
        ),
      );

      let { sessionId, chunkSize, totalChunks, nextChunkIndex, uploadedBytes } = session;

      // 2. Upload chunks
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

      // 3. Complete session → returns StorageUploadReference
      const result = await firstValueFrom(
        this.http.post<StorageUploadReference>(
          `${environment.apiBaseUrl}/api/storage/upload/sessions/${sessionId}/complete`,
          {},
        ),
      );

      // 4. Activate so the URL is publicly accessible
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

  /** @deprecated Use uploadChatFile instead */
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

    // Combine remote + local audio tracks
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

    // Notify the peer that recording has started
    if (this.currentCallPeer) {
      this.connection?.invoke('NotifyRecording', this.currentCallPeer, true).catch(console.error);
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

  /** Stop recording and auto-upload to chat. Called on manual stop or call cleanup. */
  stopRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.isRecording$.next(false);
      this.isRecordingPaused$.next(false);
      return;
    }
    const receiverId = this.currentCallPeer;
    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

    // Notify the peer that recording has stopped
    if (receiverId) {
      this.connection?.invoke('NotifyRecording', receiverId, false).catch(console.error);
    }

    this.mediaRecorder.addEventListener('stop', async () => {
      const chunks = [...this.recordedChunks];
      this.recordedChunks = [];
      this.isRecording$.next(false);
      this.isRecordingPaused$.next(false);
      if (chunks.length === 0 || !receiverId) return;
      const blob = new Blob(chunks, { type: mimeType });
      const ext = mimeType.startsWith('video/') ? 'webm' : 'webm';
      const file = new File([blob], `recording_${Date.now()}.${ext}`, { type: mimeType });
      const result = await this.uploadChatFile(file);
      if (!result) return;
      // Route to group chat when this was a group call
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

      // Replace the video sender in the peer connection
      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        this.originalVideoTrack = sender.track ?? undefined;
        await sender.replaceTrack(screenTrack);
      }

      // Update local preview stream
      const local = this.localStream$.getValue();
      if (local) {
        this.localStream$.next(new MediaStream([screenTrack, ...local.getAudioTracks()]));
      }

      this.isScreenSharing$.next(true);
      screenTrack.onended = () => this.stopScreenShare();
    } catch {
      // User cancelled getDisplayMedia
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

  // ─────────────────────────────────────────────────────────────────────────
  // Mic / Camera toggle
  // ─────────────────────────────────────────────────────────────────────────

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
  // Group chat (REST + hub)
  // ─────────────────────────────────────────────────────────────────────────

  getGroups(): Promise<ChatGroup[]> {
    return firstValueFrom(
      this.http.get<ChatGroup[]>(`${environment.apiBaseUrl}/api/su/chat/groups`),
    );
  }

  getGroupHistory(groupId: string, page = 1): Promise<ChatGroupMessage[]> {
    return firstValueFrom(
      this.http.get<ChatGroupMessage[]>(
        `${environment.apiBaseUrl}/api/su/chat/groups/${encodeURIComponent(groupId)}/history`,
        { params: { page, pageSize: 50 } },
      ),
    ).then(msgs => msgs.map(m => ({ ...m, sentAt: new Date(m.sentAt) })));
  }

  createGroup(name: string, memberUserIds: string[]): void {
    this.connection?.invoke('CreateGroup', name, memberUserIds).catch(console.error);
  }

  /** Initiate a group call — hub broadcasts IncomingCall with group context to all online members */
  async startGroupCallHub(groupId: string, callType: 'audio' | 'video'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentCallPeer = groupId; // used as placeholder peer id for the session
    this.currentGroupCallId = groupId;
    this.callStatus$.next('calling');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    this.localStream$.next(stream);

    // Temporary peer connection just to generate an offer that members can use
    this.peerConnection = this.buildPeerConnection(groupId);
    stream.getTracks().forEach(t => this.peerConnection!.addTrack(t, stream));

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.connection?.invoke('StartGroupCall', groupId, callType, JSON.stringify(offer)).catch(console.error);
  }

  updateGroup(groupId: string, name: string, memberUserIds: string[]): void {
    this.connection?.invoke('UpdateGroup', groupId, name, memberUserIds).catch(console.error);
  }

  sendGroupTextMessage(groupId: string, text: string): void {
    this.connection?.invoke('SendGroupMessage', groupId, text, 0, null).catch(console.error);
  }

  sendGroupImageMessage(groupId: string, attachmentId: string, accessUrl: string): void {
    this.connection?.invoke('SendGroupMessage', groupId, accessUrl, 1, attachmentId).catch(console.error);
  }

  sendGroupFileMessage(groupId: string, attachmentId: string): void {
    this.connection?.invoke('SendGroupMessage', groupId, '', 2, attachmentId).catch(console.error);
  }

  cancelGroupMessage(messageId: string): void {
    this.connection?.invoke('CancelGroupMessage', messageId).catch(console.error);
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

  async answerCall(callerId: string, sdpOffer: string, callType: 'audio' | 'video', accept: boolean, groupId?: string): Promise<void> {
    if (!accept) {
      this.connection?.invoke('AnswerCall', callerId, '', false, groupId ?? null).catch(console.error);
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

    this.connection?.invoke('AnswerCall', callerId, JSON.stringify(answer), true, groupId ?? null).catch(console.error);
  }

  /** End a p2p call. For group call callers, use endGroupCall() instead. */
  endCall(): void {
    if (this.currentCallPeer) {
      this.connection?.invoke('EndCall', this.currentCallPeer).catch(console.error);
    }
    this.cleanupCall();
  }

  /** End a group call (called by the initiator). Finalises the log and notifies all members. */
  endGroupCall(groupId: string): void {
    this.connection?.invoke('EndGroupCall', groupId).catch(console.error);
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
    this.stopRecording();         // upload happens async in MediaRecorder.onstop
    this.stopScreenShare();
    this.peerConnection?.close();
    this.peerConnection = undefined;
    this.localStream$.getValue()?.getTracks().forEach(t => t.stop());
    this.localStream$.next(null);
    this.remoteStream$.next(null);
    this.callStatus$.next('idle');
    this.currentCallPeer = undefined;
    this.currentGroupCallId = undefined;
    this.isMicMuted$.next(false);
    this.isCameraOff$.next(false);
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

    this.connection.on('CallLogUpdated', (msg: ChatMessage) => {
      msg.sentAt = new Date(msg.sentAt);
      this.callLogUpdated$.next(msg);
    });

    this.connection.on('UserStatusChanged', (userId: string, isOnline: boolean) => {
      this.userStatusChanged$.next({ userId, isOnline });
    });

    this.connection.on('IncomingCall', (callerId: string, callerName: string, callType: 'audio' | 'video', sdpOffer: string, groupId?: string, groupName?: string) => {
      this.callStatus$.next('incoming');
      this.incomingCall$.next({ callerId, callerName, callType, sdpOffer, groupId, groupName });
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

    this.connection.on('RecordingNotification', (recorderId: string, isStarting: boolean) => {
      this.recordingNotification$.next({ recorderId, isStarting });
    });

    this.connection.on('GroupCreated', (group: ChatGroup) => {
      this.groupCreated$.next(group);
    });

    this.connection.on('GroupUpdated', (group: ChatGroup) => {
      this.groupUpdated$.next(group);
    });

    this.connection.on('GroupCallLogUpdated', (msg: ChatGroupMessage) => {
      this.groupCallLogUpdated$.next(msg);
    });

    this.connection.on('ReceiveGroupMessage', (msg: ChatGroupMessage) => {
      msg.sentAt = new Date(msg.sentAt);
      this.groupMessageReceived$.next(msg);
    });

    this.connection.on('GroupMessageCancelled', (id: string) => {
      this.groupMessageCancelled$.next(id);
    });

    this.connection.onreconnected(() => this.isConnected$.next(true));
    this.connection.onreconnecting(() => this.isConnected$.next(false));
    this.connection.onclose(() => this.isConnected$.next(false));
  }
}

/** Internal shape returned by the storage session endpoints. */
interface _UploadSession {
  sessionId: string;
  chunkSize: number;
  totalChunks: number;
  nextChunkIndex: number;
  uploadedBytes: number;
}
