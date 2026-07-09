// sic-app/src/app/feature/bu/rt/burt06/list.animations.ts
import { trigger, transition, style, animate, query } from '@angular/animations';

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      animate('0.25s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true }),
    query(':leave', [
      style({ opacity: 1, transform: 'translateY(0)' }),
      animate('0.2s ease-in', style({ opacity: 0, transform: 'translateY(15px)' }))
    ], { optional: true })
  ])
]);