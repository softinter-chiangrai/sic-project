import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfigSettings {
  system_prompt?: string;
  global_system_prompt?: string;
  cloud_api_key?: string;
  cloud_base_url?: string;
  cloud_model_name?: string;
  use_cloud_model?: boolean;
  vllm_deployment_mode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = `${environment.apiBaseUrl}/api/config`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<ConfigSettings> {
    return this.http.get<ConfigSettings>(this.apiUrl);
  }

  updateUserSettings(settings: {
    system_prompt?: string;
    cloud_api_key?: string;
    cloud_base_url?: string;
    cloud_model_name?: string;
    use_cloud_model?: boolean;
  }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user`, settings);
  }

  updateAdminSettings(settings: {
    global_system_prompt?: string;
    vllm_deployment_mode?: string;
  }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin`, settings);
  }
}
