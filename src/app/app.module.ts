import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { projectReducer } from './state/project/project.reducer';
import { authReducer } from './state/auth/auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './state/auth/auth.effects';
import { ProjectEffects } from './state/project/project.effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { ActionReducer } from '@ngrx/store';
import Logger from './logger.service';
import { ToastEffects } from './state/toast/taoast.effects';
import { LabelFormatPipe } from './label-format.pipe';
const log = Logger('rx:actions');

export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    log(action.type);

    return reducer(state, action);
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot({
      mode: 'ios'
    }),
    AppRoutingModule,
    StoreModule.forRoot({
      project: projectReducer,
      auth: authReducer,
      router: routerReducer
    }, {metaReducers: [logger]}),
    EffectsModule.forRoot([AuthEffects, ProjectEffects, ToastEffects]),
    StoreRouterConnectingModule.forRoot(),
    LabelFormatPipe,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
