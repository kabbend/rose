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
import { CallbackComponent } 		from './callback.component';
import { RoseTextarea } 		from './rose-textarea.directive';

import { DocumentService, reducer } from './store/document.service';
 
import { AuthService } from './auth.service';
import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
  { path: 'home', component: AppComponent },
  { path: 'callback', component: CallbackComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    RootComponent,
    AppComponent,
    CallbackComponent,
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
    RouterModule.forRoot(appRoutes),
  ],
  providers: [DocumentService, AuthService],
  bootstrap: [RootComponent]
})
export class AppModule { }
