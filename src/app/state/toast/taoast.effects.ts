import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import Logger from '../../logger.service';
import { showToast } from './toast.actions';
const log = Logger('effects:toast');

@Injectable()
export class ToastEffects {
  showToast$ = createEffect(() => this.actions$.pipe(
    ofType(showToast),
    tap(async ({ message }) => {
      log('showToast');
      const toast = await this.toastController.create({
        message,
        duration: 5000,
        position: 'top',
      });

      return toast.present();
    }),
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private toastController: ToastController
  ) { }
}
