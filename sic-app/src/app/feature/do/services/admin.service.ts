import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface VllmStatus {
  running: boolean;
  message: string;
  active_model: string | null;
  mode: string;
}

export interface VllmModels {
  models: string[];
}

export interface VllmLogs {
  logs: string;
}

export interface VllmStartRequest {
  model_name: string;
  device: 'gpu' | 'cpu';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly adminUrl = `${environment.apiBaseUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  /** GET /api/admin/vllm/status */
  getVllmStatus(): Observable<VllmStatus> {
    return this.http.get<VllmStatus>(`${this.adminUrl}/vllm/status`);
  }

  /** GET /api/admin/vllm/models */
  getModels(): Observable<VllmModels> {
    return this.http.get<VllmModels>(`${this.adminUrl}/vllm/models`);
  }

  /** GET /api/admin/vllm/logs */
  getVllmLogs(): Observable<VllmLogs> {
    return this.http.get<VllmLogs>(`${this.adminUrl}/vllm/logs`);
  }

  /** GET /api/admin/vllm/download_logs */
  getDownloadLogs(): Observable<VllmLogs> {
    return this.http.get<VllmLogs>(`${this.adminUrl}/vllm/download_logs`);
  }

  /** POST /api/admin/vllm/start */
  startVllm(modelName: string, device: 'gpu' | 'cpu' = 'gpu'): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/vllm/start`, {
      model_name: modelName,
      device
    });
  }

  /** POST /api/admin/vllm/stop */
  stopVllm(): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/vllm/stop`, {});
  }

  /** POST /api/admin/vllm/download */
  downloadModel(repoId: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/vllm/download`, {
      repo_id: repoId
    });
  }

  /** POST /api/admin/vllm/delete */
  deleteModel(modelName: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/vllm/delete`, {
      model_name: modelName
    });
  }
}
