import { Component } 	 from '@angular/core';
import { Observable } 	 from 'rxjs/Observable';

import { Section } from './store/document.model';

import { DocumentService } from './store/document.service';

@Component({
  selector: 'section-dd',
  template: `<div class="ui simple dropdown item">
    		Sections<i class="dropdown icon"></i>
    		<div class="menu">
      		  <a class="item small" *ngFor="let section of sections$ | async" href="#">{{ section.title }}</a>
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

  // raw data coming from the document service 
  sections$: Observable<Section[]>;

  constructor(private documentService : DocumentService) { 
    // get raw data
    this.sections$ = this.documentService.getSections();
    this.sections$.subscribe( s => console.log("sections=" + s.length) );
  }

}


