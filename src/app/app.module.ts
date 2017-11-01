import { BrowserModule } 		from '@angular/platform-browser';
import { NgModule } 			from '@angular/core';
import { FormsModule }   		from '@angular/forms';
import { BrowserAnimationsModule } 	from '@angular/platform-browser/animations';
import { HttpModule } 			from '@angular/http';

import { DragDropModule} 	from 'primeng/primeng';
import { Autosize } 		from './autosize.directive';
import { MarkdownModule} 	from 'angular2-markdown';
import { StoreModule } 		from '@ngrx/store';

import { AppComponent } 		from './app.component';
import { RootComponent } 		from './root.component';
import { SectionDropDownComponent } 	from './dd.component';
import { DocumentListComponent } 	from './dl.component';
import { RoseTextarea } 		from './rose-textarea.directive';

import { DocumentService, reducer } from './store/document.service';

import {Routes, RouterModule} from "@angular/router";

const routes: Routes = [
 { path: '', component: AppComponent },
];

@NgModule({
  declarations: [
    RootComponent,
    AppComponent,
    SectionDropDownComponent,
    DocumentListComponent,
    Autosize,
    RoseTextarea,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    DragDropModule,
    MarkdownModule,
    HttpModule,
    StoreModule.provideStore(reducer),
    RouterModule.forRoot(routes, {useHash: true})
  ],
  providers: [DocumentService],
  bootstrap: [RootComponent]
})
export class AppModule { }
