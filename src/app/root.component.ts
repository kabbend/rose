import { Component, OnInit, ElementRef }  from '@angular/core';
import { Router }        from "@angular/router";

import { AppComponent }    from './app.component';
import { DocumentService } from './store/document.service';

@Component({
  selector: 'app-root',
  template: `
	<div class="ui segment" id="topmenu">
	<div class="ui fixed inverted violet menu">
    	<div class="ui inverted item">
	  <section-dl (docSelect)="selectDoc($event)"></section-dl>
	</div>
    	<div class="ui inverted item" *ngIf="thereAreSections" >
	  <section-dd (scroll)="scroll($event)"></section-dd>
	</div>
	<div class="ui text menu">
  	  <div class="ui inverted item">{{docTitle}}</div>
	</div>
    	<div class="right menu">
      	<div class="item"> <a class="ui button">Modify</a> </div>
      	<div class="item"> <a class="ui positive button" (click)="newDoc()">New Document</a> </div>
      	<div class="item"> <a class="ui button">Log in</a> </div>
    	</div>
	</div>
	</div>
	<rogse-app></rogse-app>
	    `,
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class RootComponent implements OnInit {

  thereAreSections: boolean = false;
  docTitle: string = "loading...";

  constructor(private documentService : DocumentService, private element: ElementRef) { 
	this.documentService.getSections().subscribe( s => this.thereAreSections = (s.length != 0) );
	this.documentService.getDocuments().subscribe( docs => docs.map( d => { if (d.current == 'true') this.docTitle = d.title; }) );
  }

  // 
  // at first initialization, load all documents and default one from database
  // 
  ngOnInit() {
    this.documentService.loadAllDocs();
  }

  //
  // On section select in the dropdown, scroll to the corresponding part
  //
  scroll(id: string) {
        let elem = document.getElementById(id)
	if (elem) { elem.scrollIntoView(); window.scrollBy(0,-70); }
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


}


