import { HostListener, Component, OnInit, AfterViewChecked, ElementRef }  from '@angular/core';

import { AppComponent }    from './app.component';
import { CallbackComponent }    from './callback.component';
import { DocumentService } from './store/document.service';

import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';

import { Observable }    from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

interface sectionOffset {
	textid: string;
	title: string;
	offset: number;
};

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
    	  <div class="item" style="width:20%;height:15px;"> 
    	  <div *ngIf="authService.isAuthenticated() && thereAreSections" class="ui inverted item"> 
		<section-dd (scroll)="scroll($event)"></section-dd> 
	  </div>
	  </div>
    	  <div class="item" style="width:50%;height:15px;"> 
		<div class="ui container center aligned" style="width:100%;" *ngIf="authService.isAuthenticated() && thereAreDocuments">
		  <div class="ui transparent input" style="width:100%;">
                     <input style="text-align:center;" type="text" [value]="docTitle" #menubox (keyup.enter)="updateTitle(menubox.value)">
         	  </div>
		</div>
	  </div>
    	  <div class="item" style="width:25%;height:15px;"> 
		<div class="ui container aligned" style="width:100%;font-size:90%;">
		     {{secTitle}}
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

export class RootComponent implements OnInit, AfterViewChecked {

  thereAreSections: boolean = false;	// dynamically check if there are sections to show
  thereAreDocuments: boolean = false;	// dynamically check if there are documents to show
  docTitle: string = "loading...";	// store current document title
  secTitle: string = '';
  docId: string = "0";			// store current document id
  scrollY: number = 0;			// store current page scroll in px
  menu_top: number = 0;			// menu offset (in pixels) from top-of-page, when user scrolls
  sectionOffsets: sectionOffset[] = [];  // offset of each (sorted) section, so we know in which section we are depending on scroll
 
  //
  // detect and store page scroll, move menus accordingly
  //
  @HostListener('window:scroll', ['$event'])
  onScroll($event){

    // get current scroll offset
    this.scrollY = $event.target.scrollingElement.scrollTop;

    // find 1st section with this offset 
    this.secTitle = ''; 
    for(let i=0;i<this.sectionOffsets.length;i++) {
	if (this.sectionOffsets[i].offset <= this.scrollY) { this.secTitle = this.sectionOffsets[i].title; }
	else break;	
    }

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
		if (offset < -70 && offset > -115) { elem3.style.marginTop = (-70+(-70-this.menu_top))+'px'; }
		if (offset < -115) { elem3.style.marginTop = '-25px'; }
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

  //
  // store position of each section, so we know where we are when page scrolls
  //
  ngOnInit() {

	Observable.combineLatest(
        this.documentService.getTexts(),
        this.documentService.getSections(),
        (t,s) => { var ret = [];
                   for(var i=0;i<s.length;i++) { ret.push( { text: t.find( t => (t.id == s[i].starttextid) ) || null , section: s[i] }); }
                   ret = ret.filter( r => r.text != null  ).sort( (a,b) => a.text.row - b.text.row );
                   return ret.map( r => r.section );
                 }
    ).subscribe( 
		s => { this.sectionOffsets = []; 
		       s.map( 
				section => { let id = document.getElementById(section.starttextid);
					     let y = 0;
					     if (id) { y = id.getBoundingClientRect().top; console.log("top="+y);}
					     this.sectionOffsets.push(	{ 
							textid: section.starttextid, 
							title: section.title,
							offset: y
							} 
						); 
					   }	
			    );
			console.log("new offsets");
			console.log(this.sectionOffsets);
  		     }
		);
  }


  ngAfterViewChecked() {
	// little trick here: The Observable for sectionOffsets has been declared, but it might happen that
	// it has not returned any value yet (array is empty) or it has returned some values but the DOM was not
	// rendered yet (so all 'top' values are nil). We check for these 2 cases at each AfterViewChecked cycle
	// and fill-in sectionOffsets array when needed
	if (this.sectionOffsets.length == 0) return;
	if (this.sectionOffsets[0].offset == 0) {
		// not set yet. try to fill it
		for(let i=0;i<this.sectionOffsets.length;i++) {
		  let textid = this.sectionOffsets[i].textid;
		  let id =  document.getElementById(textid);
		  if (!id) return; // DOM is not rendered yet, abort...
		  this.sectionOffsets[i].offset = id.getBoundingClientRect().top; 
		}
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

    // reset section name
    this.secTitle = '';
    this.sectionOffsets = [];

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


