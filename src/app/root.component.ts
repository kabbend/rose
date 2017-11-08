import { Component, OnInit, ElementRef }  from '@angular/core';

import { AppComponent }    from './app.component';
import { CallbackComponent }    from './callback.component';
import { DocumentService } from './store/document.service';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  template: `

    <!-- MENU -->

	<div class="ui fixed inverted violet menu">

	<!-- DOCUMENT DROPDOWN -->
    	<div *ngIf="authService.isAuthenticated()" class="ui inverted item"> <section-dl (docSelect)="selectDoc($event)"></section-dl> </div>

	<!-- SECTIONS DROPDOWN -->
    	<div *ngIf="authService.isAuthenticated() && thereAreSections" class="ui inverted item"> <section-dd (scroll)="scroll($event)"></section-dd> </div>

	<!-- DOC TITLE INPUT -->
 	<div class="item" *ngIf="authService.isAuthenticated()">
    	 <div class="ui labeled input" style="width:500px;" >
		<div class="ui label">Document title:</div>
      	 	<input type="text" [value]="docTitle" #menubox (keyup.enter)="updateTitle(menubox.value)">
    	 </div>
  	</div>

	<!-- NEW DOC -->
        <div class="item" *ngIf="authService.isAuthenticated()"> <a class="ui primary button" (click)="newDoc()"><small>New Document</small></a> </div>

    	<div class="right menu">
 	  <div class="item" *ngIf="authService.isAuthenticated()">Logged as {{authService.getUserEmail()}}</div>
      	  <div *ngIf="!authService.isAuthenticated()" class="item"> <a class="ui button" (click)="login()"><small>Log in</small></a> </div>
      	  <div *ngIf="authService.isAuthenticated()" class="item"> <a class="ui button" (click)="logout()"><small>Log out</small></a> </div>
    	</div>

	</div>

    <!-- END OF MENU, LINE 1 -->

    <!-- MENU, LINE 2 -->

	<div class="ui inverted fixed blue menu" style="position:fixed;top:50px;overflow:hidden;z-index:+1;">
    	<div class="item" style="width:34.65%;">INFOS</div>
    	<div class="item" style="width:31.35%;">NARRATION</div>
    	<div class="item" style="width:  33%;">EVENTS</div>
	</div>

    <!-- END OF MENU, LINE 2 -->

	<router-outlet></router-outlet>

	    `,
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class RootComponent implements OnInit {

  thereAreSections: boolean = false;	// dynamically check if there are sections to show
  docTitle: string = "loading...";	// store current document title
  docId: string = "0";			// store current document id

  constructor(private documentService : DocumentService, private element: ElementRef, private authService: AuthService ) { 

	 authService.handleAuthentication();

	 // thereAreSections is based on sections observable
	 this.documentService.getSections().subscribe( s => this.thereAreSections = (s.length != 0) );

	 // title and id are based on documents observable
	 this.documentService.getDocuments().subscribe( docs => docs.map( d => { 
			  if (d.current == 'true') { this.docTitle = d.title; this.docId = d.id; }
			}) );
  }

  logout() {
	this.authService.logout();
  }

  login() {
	this.authService.login();
  }

  // 
  // at first initialization, load all documents from database
  // this also sets the default one
  // 
  ngOnInit() {
    this.documentService.loadAllDocs();
  }

  //
  // On section select in the dropdown, scroll to the corresponding part
  //
  scroll(id: string) {
        let elem = document.getElementById(id)
	if (elem) { elem.scrollIntoView(); window.scrollBy(0,-110); }
  }

  //
  // On Doc select in the dropdown, store it as new default and load it
  //
  selectDoc(docId: string) {
    // set selected doc in the store, for all other components
    this.documentService.setDefaultDoc(docId);
    // reload all texts & sections
    this.documentService.loadAllTexts(docId);
  }

  //
  // create a new document when button clicked
  // this will make it the default, and load it at the same time
  //
  newDoc() {
   this.documentService.newDoc();
  }


  //
  // change title of the current document
  //
  updateTitle( newTitle: string ) {
   this.documentService.updateDocTitle( this.docId, newTitle );
  }

}


