import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { SocketIO } from 'services/socket-io';
import {Debounce} from 'angular2-debounce';

import {AppComponent} from './app.component';
import {RouterModule, Routes} from "@angular/router";
import {RegisterComponent} from "./register.component";
import {GameComponent} from "./game.component";

const appRoutes: Routes = [
  {
    path: '',
    component: GameComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  }
];

@NgModule({
  declarations: [
    Debounce,
    AppComponent,
    GameComponent,
    RegisterComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    SocketIO
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
