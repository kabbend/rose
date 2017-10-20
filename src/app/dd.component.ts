import { Component, EventEmitter, Output } 	 from '@angular/core';
import { Observable } 	 from 'rxjs/Observable';
import { Router } 	 from "@angular/router";
import 'rxjs/add/observable/combineLatest';

import { Section } from './store/document.model';

import { DocumentService } from './store/document.service';

@Component({
  selector: 'section-dd',
  template: `<div class="ui simple dropdown item">
    		Sections<i class="dropdown icon"></i>
    		<div class="menu">
      		  <div class="item small" *ngFor="let section of sections$ | async" style="cursor: pointer" (click)="emitScroll(section.starttextid)" >{{ section.title }}
			</div>
    		</div>
  	    </div>
	  `,
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class SectionDropDownComponent {

  @Output() scroll = new EventEmitter<string>();

  sections$: Observable<Section[]>;

  emitScroll(id: string) {
    console.log("emit scroll:"+id);
    this.scroll.emit(id);
  }

  constructor(private documentService : DocumentService) { 
    // get raw data then filter it and sort it
    this.sections$ = Observable.combineLatest(
	this.documentService.getTexts(),
	this.documentService.getSections(),
        (t,s) => { var ret = [];
                   for(var i=0;i<s.length;i++) { ret.push( { text: t.find( t => (t.id == s[i].starttextid) ) || null , section: s[i] }); }
		   ret = ret.filter( r => r.text != null  ).sort( (a,b) => a.text.row - b.text.row );
		   return ret.map( r => r.section );
                 }
    );

  }

}

