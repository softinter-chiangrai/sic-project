import { FormControl } from '@angular/forms';

// สร้าง Utility Type กลางของระบบไว้ที่นี่
export type ToForm<T> = {
  [K in keyof T]: FormControl<T[K] | null>;
};
