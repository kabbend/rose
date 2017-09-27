import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Text, TextRow, Document, Section } from './store/document.model';

//import { InputTextModule} from 'primeng/primeng';
import { DragDropModule} from 'primeng/primeng';
import { Autosize } from './autosize.directive';

import { DocumentService } from './store/document.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class AppComponent implements OnInit {

  draggedText : string;
  rows$: Observable<TextRow[]>;

  constructor(private documentService : DocumentService) { 
    this.rows$ = this.documentService.getRows();
    this.documentService.loadAllTexts();
  }

  ngOnInit() : void {}

  currentEdition : number = -1;
  currentCol: number = 0;

  addNewRow(i:number) {
    this.documentService.addNewEmptyRow( 0 /* docId, ignored for now */, i /* line index */);
  }

  updateText(id:string,content:string) {
    this.documentService.updateText(id,content);
  }
  
  dragEnd(event) { 
    this.draggedText = '';
  }

  dragStart(event,t:Text) { 
    this.draggedText = t.content;
  }

  myDrop(target:Text,event) { 
    target.content = this.draggedText; 
    this.draggedText = ''; 
    this.documentService.updateText(target.id,target.content);
  }

}


