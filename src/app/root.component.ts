import { HostListener, Component, OnInit, ElementRef }  from '@angular/core';

import { AppComponent }    from './app.component';
import { CallbackComponent }    from './callback.component';
import { DocumentService } from './store/document.service';

import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-root',
  template: `

	<span id="rogse-favicon" style="position:fixed;top:15px;left:15px;z-index:1000;" >
	<img src="favicon.png" style="width:60px;height:60px;">
	</span>

    <!-- MENU -->

	<div id="rogse-menu" class="ui small fixed inverted violet borderless menu" style="height:70px">

    	<div class="ui inverted item"> &nbsp;&nbsp; </div>
    	<div class="ui inverted item"> &nbsp;&nbsp; </div>

	<!-- DOCUMENT DROPDOWN -->
    	<div *ngIf="authService.isAuthenticated() && thereAreDocuments" class="ui inverted item"> <section-dl (docSelect)="selectDoc($event)"></section-dl> </div>

	<!-- NEW DOC -->
        <div class="item" *ngIf="authService.isAuthenticated()"> <a class="ui primary button" (click)="newDoc()"><small>New Document</small></a> </div>

    	<div class="right menu">
 	  <div class="item" *ngIf="authService.isAuthenticated()">Logged as {{authService.getUserEmail()}}</div>
      	  <div *ngIf="!authService.isAuthenticated()" class="item"> <a class="ui button" (click)="login()"><small>Log in</small></a> </div>
      	  <div *ngIf="authService.isAuthenticated()" class="item"> <a class="ui button" (click)="logout()"><small>Log out</small></a> </div>
    	</div>

	</div>

    <!-- LINE 2 -->

	<div id="rogse-menu-3" class="ui inverted fixed blue borderless menu" style="position:fixed;top:70px;z-index:+2;">
	  <!-- SECTIONS DROPDOWN -->
    	  <div *ngIf="authService.isAuthenticated() && thereAreSections" class="ui inverted item"> 
		<section-dd (scroll)="scroll($event)"></section-dd> 
	  </div>
    	  <div class="item" style="width:90%;height:20px;"> 
		<div class="ui container center aligned" style="width:100%;" *ngIf="authService.isAuthenticated() && thereAreDocuments">
		  <div class="ui transparent input" style="width:100%;">
                     <input style="text-align:center;" type="text" [value]="docTitle" #menubox (keyup.enter)="updateTitle(menubox.value)">
         	  </div>
		</div>
	  </div>
	</div>

    <!-- LINE 3 -->

	<div id="rogse-menu-2" class="ui inverted fixed violet borderless menu" style="position:fixed;top:70px;overflow:hidden;z-index:+1;height:20px;">
    	<div class="item" style="width:34.65%;"><div class="ui container center aligned">INFOS</div></div>
    	<div class="item" style="width:31.35%;"><div class="ui container center aligned">NARRATION</div></div>
    	<div class="item" style="width:  33%;"> <div class="ui container center aligned">EVENTS</div></div>
	</div>

    <!-- END OF MENU -->

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
  thereAreDocuments: boolean = false;	// dynamically check if there are documents to show
  docTitle: string = "loading...";	// store current document title
  docId: string = "0";			// store current document id
  scrollY: number = 0;			// store current page scroll in px
  menu_top: number = 0;
 
  //
  // detect and store page scroll
  //
  @HostListener('window:scroll', ['$event'])
  onScroll($event){
    this.scrollY = $event.target.scrollingElement.scrollTop;
    if (this.scrollY > 400) 
	{ 
		var offset = (400 - this.scrollY) / 10 ;
		this.menu_top = offset; 
		let elem1 = document.getElementById("rogse-favicon");
		let elem2 = document.getElementById("rogse-menu");
		let elem3 = document.getElementById("rogse-menu-2");
		let elem4 = document.getElementById("rogse-menu-3");
		elem1.style.marginTop=this.menu_top+'px';
		elem2.style.marginTop=this.menu_top+'px';
		if (offset < -70) { 
			elem4.style.marginTop = '-70px'; 
		} else { 
			elem4.style.marginTop = this.menu_top+'px'; 
			elem3.style.marginTop = this.menu_top+'px'; 
		}
		if (offset < -70 && offset > -120) { elem3.style.marginTop = (-70+(-70-this.menu_top))+'px'; }
		if (offset < -120) { elem3.style.marginTop = '-20px'; }
	}
	else
	{ 
		this.menu_top = 0; 
		let elem1 = document.getElementById("rogse-favicon");
		let elem2 = document.getElementById("rogse-menu");
		let elem3 = document.getElementById("rogse-menu-2");
		let elem4 = document.getElementById("rogse-menu-3");
		elem1.style.marginTop=this.menu_top+'px';
		elem2.style.marginTop=this.menu_top+'px';
		elem3.style.marginTop=this.menu_top+'px';
		elem4.style.marginTop=this.menu_top+'px';
	}

  }

  constructor(private documentService : DocumentService, private element: ElementRef, private authService: AuthService, private loaderService: LoaderService ) { 

	 if (this.authService.isAuthenticated()) {
	  // we already have a user logged in. Load all its docs...
	  this.documentService.loadAllDocs( this.authService.getUserEmail() ); 
	 } 
	 else
	 {
	  // treat authentication (asynchronously) and provide appropriate callback to load docs
	  // when we know the user...
	  authService.handleAuthentication(  () => { 
		  console.log("calling loadAllDocs now");
		  this.documentService.loadAllDocs( this.authService.getUserEmail() ); 
	        } );
	 }

	 // thereAreSections is based on sections observable
	 this.documentService.getSections().subscribe( s => this.thereAreSections = (s.length != 0) );

	 // title and id and thereAreDocuments are based on documents observable
	 this.documentService.getDocuments().subscribe( docs => docs.map( d => { 
			  if (d.current == 'true') { this.docTitle = d.title; this.docId = d.id; this.thereAreDocuments = true; }
			}) );
  }

  logout() {
	this.authService.logout();
  }

  login() {
	this.authService.login();
  }

  // deprecated 
  ngOnInit() {
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

    // start spinner, after getting back to top of page 
    // it will be stopped asynchronously when all texts are loaded
    let elem = document.getElementById('top-of-page');
    if (elem) { elem.scrollIntoView(); }
    this.loaderService.start(); 

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
   this.documentService.newDoc( this.authService.getUserEmail() );
  }


  //
  // change title of the current document
  //
  updateTitle( newTitle: string ) {
   this.documentService.updateDocTitle( this.docId, newTitle );
  }

}


