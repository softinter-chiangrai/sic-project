import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SicButtonComponent } from 'sic-ng';
import { environment } from '../../../../../../environments/environment';
import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';
import { DocumentVersionModel } from '../pmdt19A/pmdt19A.model';
import { buildSnapshotView, SnapshotView } from './snapshot-fields.util';

/** หน้าเนื้อหาเอกสาร ณ เวอร์ชันที่เลือก: แสดงทุก field ใน snapshot (HTML แสดงเป็นเนื้อหาจริง) */
@Component({
  selector: 'app-pmdt19B',
  standalone: true,
  imports: [CommonModule, TranslateModule, SicButtonComponent, SicDatePipe],
  templateUrl: './pmdt19B.component.html',
  styleUrls: ['./pmdt19B.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt19BComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly location = inject(Location);
  private readonly translate = inject(TranslateService);

  version!: DocumentVersionModel;
  view = signal<SnapshotView | null>(null);
  formattedJson = signal('');
  rawText = signal('');
  attachedFiles = signal<any[]>([]);

  ngOnInit(): void {
    this.version = this.route.snapshot.data['version'] as DocumentVersionModel;
    const lang = (this.translate.currentLang || this.translate.defaultLang) === 'en' ? 'en' : 'th';

    let parsed: Record<string, any> | null = null;
    if (this.version?.snapshotData) {
      try {
        const data = typeof this.version.snapshotData === 'string'
          ? JSON.parse(this.version.snapshotData) : this.version.snapshotData;
        parsed = data && typeof data === 'object' ? data : null;
        if (!parsed) this.rawText.set(String(this.version.snapshotData));
      } catch {
        this.rawText.set(String(this.version.snapshotData));
      }
    }

    if (parsed) {
      this.view.set(buildSnapshotView(parsed, lang));
      this.formattedJson.set(JSON.stringify(parsed, null, 2));
      const refs = parsed['uploadReferences'] ?? parsed['uploadGroupData'];
      if (Array.isArray(refs) && refs.length) {
        this.attachedFiles.set(refs);
        return;
      }
      const groupId = parsed['uploadGroupId'] ?? parsed['attachmentGroupId'] ?? this.version.fileRefId;
      if (groupId) this.fetchFiles(groupId);
    } else if (this.version?.fileRefId) {
      this.fetchFiles(this.version.fileRefId);
    }
  }

  private fetchFiles(groupId: string): void {
    this.http.get<any>(`${environment.apiBaseUrl}/api/storage/group/${groupId}`).subscribe({
      next: (res) => this.attachedFiles.set(Array.isArray(res) ? res : (res?.data || [])),
      error: (err) => console.warn('Could not fetch version files:', err),
    });
  }

  back(): void {
    this.location.back();
  }

  getFileIcon(fileName: string): string {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return 'bi-filetype-pdf text-red-400';
      case 'doc':
      case 'docx': return 'bi-filetype-docx text-blue-400';
      case 'xls':
      case 'xlsx': return 'bi-filetype-xlsx text-emerald-400';
      case 'ppt':
      case 'pptx': return 'bi-filetype-pptx text-orange-400';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return 'bi-file-earmark-image text-purple-400';
      case 'zip':
      case 'rar': return 'bi-file-earmark-zip text-amber-400';
      default: return 'bi-file-earmark-text text-gray-400';
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
