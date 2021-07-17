import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { PoliticalPartyComponent } from './political-party/political-party.component';
import { BallotComponent } from './ballot/ballot.component'

@NgModule({
  declarations: [
    AppComponent,
    PoliticalPartyComponent,
    BallotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgApexchartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
