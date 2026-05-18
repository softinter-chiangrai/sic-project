import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SicButton } from '../sic-button/sic-button';

export interface SicStepItem {
  id?: string | number;
  title: string;
  description?: string;
  disabled?: boolean;
  skippable?: boolean;
}

@Directive({
  selector: 'ng-template[sicStep]',
  standalone: true,
})
export class SicStepTemplate {
  constructor(readonly template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'sic-stepper',
  standalone: true,
  imports: [NgTemplateOutlet, SicButton],
  templateUrl: './sic-stepper.html',
  styleUrl: './sic-stepper.css',
})
export class SicStepper implements AfterContentInit {
  @Input() steps: SicStepItem[] = [];
  @Input() activeStep = 0;
  @Input() disabled = false;
  @Input() clickable = true;
  @Input() showDescriptions = true;
  @Input() showNavigation = true;
  @Input() showSkip = true;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() previousText = 'Previous';
  @Input() nextText = 'Next';
  @Input() skipText = 'Skip';
  @Input() finishText = 'Finish';

  @Output() readonly activeStepChange = new EventEmitter<number>();
  @Output() readonly stepSelect = new EventEmitter<SicStepItem>();
  @Output() readonly stepSkip = new EventEmitter<SicStepItem>();
  @Output() readonly finish = new EventEmitter<void>();

  @ContentChildren(SicStepTemplate) stepTemplates!: QueryList<SicStepTemplate>;

  hasProjectedSteps = false;
  private readonly skippedSteps = new Set<number>();

  ngAfterContentInit(): void {
    this.hasProjectedSteps = this.stepTemplates.length > 0;
  }

  trackStep(index: number, step: SicStepItem): string | number {
    return step.id ?? index;
  }

  selectStep(index: number): void {
    const step = this.steps[index];

    if (this.disabled || !step || step.disabled || !this.clickable || !this.canSelectStep(index)) {
      return;
    }

    this.activeStep = index;
    this.activeStepChange.emit(index);
    this.stepSelect.emit(step);
  }

  isCompleted(index: number): boolean {
    return index < this.activeStep && !this.skippedSteps.has(index);
  }

  isCurrent(index: number): boolean {
    return index === this.activeStep;
  }

  isDisabled(index: number): boolean {
    return !!this.steps[index]?.disabled;
  }

  previous(): void {
    if (this.disabled || this.activeStep <= 0) {
      return;
    }

    const previousIndex = this.findPreviousAvailableStep(this.activeStep - 1);

    if (previousIndex === -1) {
      return;
    }

    this.selectStep(previousIndex);
  }

  next(): void {
    if (this.disabled) {
      return;
    }

    this.skippedSteps.delete(this.activeStep);

    if (this.isLastStep()) {
      this.finish.emit();
      return;
    }

    const nextIndex = this.findNextAvailableStep(this.activeStep + 1);

    if (nextIndex === -1) {
      this.finish.emit();
      return;
    }

    this.selectStep(nextIndex);
  }

  canGoPrevious(): boolean {
    return !this.disabled && this.findPreviousAvailableStep(this.activeStep - 1) !== -1;
  }

  canGoNext(): boolean {
    return !this.disabled && this.findNextAvailableStep(this.activeStep + 1) !== -1;
  }

  isLastStep(): boolean {
    return this.findNextAvailableStep(this.activeStep + 1) === -1;
  }

  currentTemplate(): TemplateRef<unknown> | null {
    return this.stepTemplates.get(this.activeStep)?.template ?? null;
  }

  canSkip(): boolean {
    const currentStep = this.steps[this.activeStep];
    return !this.disabled && !!currentStep?.skippable && this.findNextAvailableStep(this.activeStep + 1) !== -1;
  }

  canSelectStep(index: number): boolean {
    if (index <= this.activeStep) {
      return true;
    }

    return index === this.findNextAvailableStep(this.activeStep + 1);
  }

  skip(): void {
    const currentStep = this.steps[this.activeStep];

    if (!currentStep || !this.canSkip()) {
      return;
    }

    this.skippedSteps.add(this.activeStep);
    this.stepSkip.emit(currentStep);
    const nextIndex = this.findNextAvailableStep(this.activeStep + 1);

    if (nextIndex !== -1) {
      this.selectStep(nextIndex);
    }
  }

  private findNextAvailableStep(startIndex: number): number {
    for (let index = startIndex; index < this.steps.length; index += 1) {
      if (!this.steps[index]?.disabled) {
        return index;
      }
    }

    return -1;
  }

  private findPreviousAvailableStep(startIndex: number): number {
    for (let index = startIndex; index >= 0; index -= 1) {
      if (!this.steps[index]?.disabled) {
        return index;
      }
    }

    return -1;
  }
}
