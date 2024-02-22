import { createAction, props } from '@ngrx/store';

const _ = log => `[Toast] ${log}`;

export const showToast = createAction(_('Show Toast'),  props<{ message: string}>());
