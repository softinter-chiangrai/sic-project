import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DogBuddyService, ChatMessage } from '../../services/dog-buddy.service';
import { OrganizationService, Tag, Category, Folder } from '../../services/organization.service';

@Component({
  selector: 'app-buddy-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buddy-chat.component.html',
  styleUrls: ['./buddy-chat.component.css']
})
export class BuddyChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isProcessing: boolean = false;

  // Context Panel
  showContextPanel: boolean = false;
  tags: Tag[] = [];
  categories: Category[] = [];
  folders: Folder[] = [];

  selectedTagIds: string[] = [];
  selectedCategoryId: string = '';
  selectedFolderId: string = '';

  constructor(
    private dogBuddyService: DogBuddyService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'assistant',
      content: 'Hello! I am Buddy, your AI assistant. Use the context panel to select folders, categories, or tags to focus my knowledge. How can I help you today?'
    });
    this.loadContextOptions();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {}

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  loadContextOptions(): void {
    this.orgService.getTags().subscribe({ next: (t) => { this.tags = t; this.cdr.detectChanges(); }, error: () => {} });
    this.orgService.getCategories().subscribe({ next: (c) => { this.categories = c; this.cdr.detectChanges(); }, error: () => {} });
    this.orgService.getFolders().subscribe({ next: (f) => { this.folders = f; this.cdr.detectChanges(); }, error: () => {} });
  }

  toggleContextPanel(): void {
    this.showContextPanel = !this.showContextPanel;
  }

  toggleTagSelection(tagId: string): void {
    const idx = this.selectedTagIds.indexOf(tagId);
    if (idx === -1) this.selectedTagIds.push(tagId);
    else this.selectedTagIds.splice(idx, 1);
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  clearContext(): void {
    this.selectedTagIds = [];
    this.selectedCategoryId = '';
    this.selectedFolderId = '';
  }

  get activeContextCount(): number {
    let count = this.selectedTagIds.length;
    if (this.selectedCategoryId) count++;
    if (this.selectedFolderId) count++;
    return count;
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isProcessing) return;

    const userQuestion = this.userInput.trim();
    this.messages.push({ role: 'user', content: userQuestion });
    this.userInput = '';
    this.isProcessing = true;

    this.messages.push({ role: 'assistant', content: '' });
    const currentAssistantMsgIndex = this.messages.length - 1;

    this.dogBuddyService.chat({
      question: userQuestion,
      history: this.messages.slice(0, -2),
      folder_id: this.selectedFolderId || undefined,
      category_id: this.selectedCategoryId || undefined,
      tag_ids: this.selectedTagIds.length > 0 ? this.selectedTagIds : undefined,
    }).subscribe({
      next: (chunk: string) => {
        this.messages[currentAssistantMsgIndex].content += chunk;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('CHAT ERROR:', err);
        this.messages[currentAssistantMsgIndex].content = 'Sorry, an error occurred. Details: ' + (err.message || err);
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }
}
