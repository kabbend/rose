import { Component, EventEmitter, Output } 	 from '@angular/core';
import { Observable } 	 from 'rxjs/Observable';

import { Document } from './store/document.model';

import { DocumentService } from './store/document.service';

@Component({
  selector: 'section-dl',
  template: `
	    <div class="ui simple dropdown item">
    	        Documents <i class="dropdown icon"></i>
    		<div class="menu">
      		  <div class="item" *ngFor="let document of documents$ | async" style="cursor: pointer" (click)="emitDocSelect(document.id)" >{{ document.title }}
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

export class DocumentListComponent {

  @Output() docSelect = new EventEmitter<string>();

  documents$: Observable<Document[]>;

  emitDocSelect(id: string) {
    console.log("emit doc selection:"+id);
    this.docSelect.emit(id);
  }

  constructor(private documentService : DocumentService) { 
    // get documents and sort them alphabetically
    this.documents$ = this.documentService.getDocuments().map(
	t => t.sort( (a,b) => { return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0; } )
	);
  }

}

