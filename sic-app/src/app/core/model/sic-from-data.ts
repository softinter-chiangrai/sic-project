import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SicEntityState } from './sic-entity-state';

type SicStateModel = {
  id?: unknown;
  state?: SicEntityState | null;
};

export class SicFromData<TModel extends object & SicStateModel> {
  private readonly initialModel: TModel;
  private readonly initialComparableValue: Record<string, unknown>;
  private readonly subscription: Subscription;
  private currentState: SicEntityState;

  constructor(
    private readonly sourceFormGroup: FormGroup,
    model?: TModel,
  ) {
    const resolvedModel = this.resolveInitialModel(model);

    this.sourceFormGroup.patchValue(resolvedModel, { emitEvent: false });

    this.initialModel = this.cloneValue(resolvedModel);
    this.currentState = this.resolveInitialState(resolvedModel);
    this.initialComparableValue = this.toComparableValue(this.sourceFormGroup.getRawValue());

    this.writeState(this.currentState);
    this.subscription = this.sourceFormGroup.valueChanges.subscribe(() => this.syncStateFromForm());
  }

  get isChanged(): boolean {
    return this.currentState === SicEntityState.Modified || this.currentState === SicEntityState.Added || this.currentState === SicEntityState.Deleted;
  }

  get isNotChanged(): boolean {
    return this.currentState === SicEntityState.Unchanged || this.currentState === SicEntityState.Detached;
  }

  get state(): SicEntityState {
    return this.currentState;
  }

  get formGroup(): FormGroup {
    return this.sourceFormGroup;
  }

  get invalid(): boolean {
    return this.sourceFormGroup.invalid;
  }

  get valid(): boolean {
    return this.sourceFormGroup.valid;
  }

  get value(): TModel {
    const rawValue = this.sourceFormGroup.getRawValue() as Partial<TModel>;

    return {
      ...this.cloneValue(this.initialModel),
      ...rawValue,
      state: this.currentState,
    } as TModel;
  }

  delete(): void {
    this.writeState(SicEntityState.Deleted);
  }

  markAllAsTouched(): void {
    this.sourceFormGroup.markAllAsTouched();
  }

  markAsPristine(): void {
    this.sourceFormGroup.markAsPristine();
    this.currentState = SicEntityState.Detached;
  }

  destroy(): void {
    this.subscription.unsubscribe();
  }

  get dirty(): boolean {
    return this.sourceFormGroup.dirty;
  }

  private syncStateFromForm(): void {
    if (this.currentState === SicEntityState.Deleted) {
      return;
    }

    if (this.currentState === SicEntityState.Added) {
      this.writeState(SicEntityState.Added);
      return;
    }

    const currentComparableValue = this.toComparableValue(this.sourceFormGroup.getRawValue());
    const hasChanges = !this.isEqual(this.initialComparableValue, currentComparableValue);

    this.writeState(hasChanges ? SicEntityState.Modified : SicEntityState.Unchanged);
  }

  private resolveInitialState(model: TModel): SicEntityState {
    if (model.state != null) {
      return model.state;
    }

    return model.id ? SicEntityState.Unchanged : SicEntityState.Added;
  }

  private resolveInitialModel(model?: TModel): TModel {
    if (model) {
      return model;
    }

    return this.sourceFormGroup.getRawValue() as TModel;
  }

  private writeState(state: SicEntityState): void {
    this.currentState = state;

    const stateControl = this.sourceFormGroup.get('state');
    if (stateControl) {
      stateControl.setValue(state, { emitEvent: false });
    }
  }

  private toComparableValue(value: Record<string, unknown>): Record<string, unknown> {
    const comparableValue = this.cloneValue(value);
    delete comparableValue['state'];
    return comparableValue;
  }

  private cloneValue<TValue>(value: TValue): TValue {
    if (typeof globalThis.structuredClone === 'function') {
      return globalThis.structuredClone(value);
    }

    return this.cloneFallback(value);
  }

  private cloneFallback<TValue>(value: TValue): TValue {
    if (value == null || typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date) {
      return new Date(value.getTime()) as TValue;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.cloneFallback(item)) as TValue;
    }

    const clone: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      clone[key] = this.cloneFallback(item);
    }

    return clone as TValue;
  }

  private isEqual(left: unknown, right: unknown): boolean {
    if (left === right) {
      return true;
    }

    if (left instanceof Date && right instanceof Date) {
      return left.getTime() === right.getTime();
    }

    if (
      left == null ||
      right == null ||
      typeof left !== 'object' ||
      typeof right !== 'object'
    ) {
      return false;
    }

    if (Array.isArray(left) || Array.isArray(right)) {
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return false;
      }

      return left.every((item, index) => this.isEqual(item, right[index]));
    }

    const leftEntries = Object.entries(left);
    const rightEntries = Object.entries(right);

    if (leftEntries.length !== rightEntries.length) {
      return false;
    }

    return leftEntries.every(([key, value]) => this.isEqual(value, (right as Record<string, unknown>)[key]));
  }
}
