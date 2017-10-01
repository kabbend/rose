import { BrowserModule } 		from '@angular/platform-browser';
import { NgModule } 			from '@angular/core';
import { FormsModule }   		from '@angular/forms';
import { BrowserAnimationsModule } 	from '@angular/platform-browser/animations';
import { HttpModule } 			from '@angular/http';

import { DragDropModule} 	from 'primeng/primeng';
import { Autosize } 		from './autosize.directive';
import { MarkdownModule} 	from 'angular2-markdown';
import { StoreModule } 		from '@ngrx/store';

import { AppComponent } from './app.component';
import { RoseTextarea } from './rose-textarea.directive';

import { DocumentService, reducer } from './store/document.service';

@NgModule({
  declarations: [
    AppComponent,
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
    StoreModule.provideStore(reducer)
  ],
  providers: [DocumentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
