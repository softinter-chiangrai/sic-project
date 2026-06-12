import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, NgControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class SicValidator {
  /**
   * Check if error should be displayed based on control state and touched status
   */
  shouldShowError(control: AbstractControl | null, touched: boolean): boolean {
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || control.dirty || touched);
  }

  /**
   * Resolve and return the appropriate error message
   */
  resolveErrorMessage(
    errors: ValidationErrors | null,
    errorMessages: Record<string, string> = {},
  ): string | null {
    if (!errors) {
      return null;
    }

    const firstErrorKey = Object.keys(errors)[0];

    if (errorMessages[firstErrorKey]) {
      return errorMessages[firstErrorKey];
    }

    switch (firstErrorKey) {
      case 'required':
        return 'This field is required.';
      case 'email':
        return 'Please enter a valid email address.';
      case 'minlength':
        return `Minimum length is ${errors['minlength']?.requiredLength}.`;
      case 'maxlength':
        return `Maximum length is ${errors['maxlength']?.requiredLength}.`;
      case 'min':
        return `Minimum value is ${errors['min']?.min}.`;
      case 'max':
        return `Maximum value is ${errors['max']?.max}.`;
      case 'pattern':
        return 'The format is invalid.';
      default:
        return 'The value is invalid.';
    }
  }

  /**
   * Get error message for a control
   */
  getErrorMessage(
    control: AbstractControl | null,
    errorMessages: Record<string, string> = {},
  ): string | null {
    if (!control?.errors) {
      return null;
    }

    return this.resolveErrorMessage(control.errors, errorMessages);
  }

  /**
   * Get control from NgControl
   */
  getControl(ngControl: NgControl | null): AbstractControl | null {
    return ngControl?.control ?? null;
  }
}
