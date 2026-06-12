import { FormGroup } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';

export interface JoinModel {
  token: string;
}

export interface BusinessJoinFormData {
  joinForm: FormGroup<ToForm<JoinModel>>;
}
