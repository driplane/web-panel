import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { projectReducer } from './project.reducer';
import { authReducer } from './auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './auth.effects';
import { ProjectEffects } from './project.effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { ActionReducer } from '@ngrx/store';
import Logger from './logger.service';
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
    IonicModule.forRoot(),
    AppRoutingModule,
    StoreModule.forRoot({ project: projectReducer, auth: authReducer }, {metaReducers: [logger]}),
    EffectsModule.forRoot([AuthEffects, ProjectEffects]),
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
