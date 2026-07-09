import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, ConfigSettings } from '../../services/config.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-context-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './context-management.component.html',
  styleUrls: ['./context-management.component.css']
})
export class ContextManagementComponent implements OnInit {
  settings: ConfigSettings = {};
  isAdmin = false;
  isLoading = true;
  error = '';
  successMessage = '';

  // Form binds
  systemPrompt = '';
  useCloudModel = false;
  cloudApiKey = '';
  cloudBaseUrl = '';
  cloudModelName = '';

  // Admin form binds
  globalSystemPrompt = '';
  vllmDeploymentMode = 'Internal';

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.error = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.configService.getSettings().subscribe({
      next: (res) => {
        this.settings = res;
        this.systemPrompt = res.system_prompt || '';
        this.useCloudModel = !!res.use_cloud_model;
        this.cloudApiKey = res.cloud_api_key || '';
        this.cloudBaseUrl = res.cloud_base_url || '';
        this.cloudModelName = res.cloud_model_name || '';

        this.globalSystemPrompt = res.global_system_prompt || '';
        this.vllmDeploymentMode = res.vllm_deployment_mode || 'Internal';

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load configuration settings.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSaveUserSettings(): void {
    this.successMessage = '';
    this.error = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    const payload = {
      system_prompt: this.systemPrompt,
      cloud_api_key: this.cloudApiKey,
      cloud_base_url: this.cloudBaseUrl,
      cloud_model_name: this.cloudModelName,
      use_cloud_model: this.useCloudModel
    };

    this.configService.updateUserSettings(payload).subscribe({
      next: () => {
        this.successMessage = 'User settings saved successfully!';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to save user settings.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSaveAdminSettings(): void {
    if (!this.isAdmin) return;

    this.successMessage = '';
    this.error = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    const payload = {
      global_system_prompt: this.globalSystemPrompt,
      vllm_deployment_mode: this.vllmDeploymentMode
    };

    this.configService.updateAdminSettings(payload).subscribe({
      next: () => {
        this.successMessage = 'Global admin settings saved successfully!';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to save global settings.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
