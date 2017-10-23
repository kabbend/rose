import { HostListener, Component, AfterViewInit, ElementRef }  from '@angular/core';
import { Router }        from "@angular/router";

import { AppComponent }    from './app.component';
import { DocumentService } from './store/document.service';

@Component({
  selector: 'app-root',
  template: `
	<div class="ui segment" id="topmenu">
	<div class="ui fixed inverted violet menu">
    	<a class="item"><h3>My Documents</h3></a>
    	<div class="ui inverted item" *ngIf="thereAreSections" >
	  <section-dd (scroll)="scroll($event)"></section-dd>
	  <div>Section...</div>
	</div>
    	<div class="right menu">
      	<div class="item"> <a class="ui button">Log in</a> </div>
    	</div>
	</div>
	</div>
	<rogse-app [scrollY]="scrollY"></rogse-app>
	    `,
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class RootComponent {
 
@HostListener('window:scroll', ['$event'])
onScroll($event){
    this.scrollY = $event.target.scrollingElement.scrollTop;
    console.log(this.scrollY);
 }

  thereAreSections: boolean = false;
  scrollY: number = 0;

  constructor(private documentService : DocumentService, private element: ElementRef) { 
	this.documentService.getSections().subscribe( s => this.thereAreSections = (s.length != 0) );
  }

  scroll(id: string) {
        let elem = document.getElementById(id)
	if (elem) { elem.scrollIntoView(); window.scrollBy(0,-70); }
  }

}


