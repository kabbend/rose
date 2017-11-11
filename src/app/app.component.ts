import { Component }  from '@angular/core';
import { Observable } 	 from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

import { Text, TextRow, Document, Section, Line } from './store/document.model';

import { DragDropModule} from 'primeng/primeng';
import { Autosize } 	 from './autosize.directive';

import { DocumentService } from './store/document.service';
import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';

@Component({
  selector: 'rogse-app',
  templateUrl: './app.component.html',
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class AppComponent {

  // flags and information needed for drag & drop within the view
  draggedText = { text: '', sourceId: '' };
  currentEdition : number = -1;
  currentCol: number = 0;

  // raw data coming from the document service 
  rows$: Observable<TextRow[]>;
  sections$: Observable<Section[]>;
  docId: string = "0"; // default doc id is "0", waiting store to provide one

  // combined observable to be used by the view
  lines$: Observable<Line[]>;

  constructor(private documentService : DocumentService, private authService: AuthService, private loaderService: LoaderService ) {
    // get raw data
    this.rows$ = this.documentService.getRows();
    this.sections$ = this.documentService.getSections();

    // monitor docId
    this.documentService.getDocuments().subscribe( docs => { docs.map( d => { if (d.current == 'true') this.docId = d.id; } ); } );

    // combine these data into one single observable for display
    this.lines$ = Observable.combineLatest(
	this.rows$,
	this.sections$,
    	(r,s) => { var ret = [];
		   for(var i=0;i<r.length;i++) { ret.push( { section: s.find( sec => (sec.starttextid == r[i].line[0].id) ) || null , text: r[i] }); }  
		   return ret.sort( (a,b) => a.text.line[0].row - b.text.line[0].row ); 
		 }
    );

    // load all texts at startup
    // this.documentService.loadAllTexts();

  }

  login() {
    this.authService.login();
  }

  addNewRow(i:number) {
    this.documentService.addNewEmptyRow( this.docId, i /* line index */);
  }

  deleteRow(i:number) {
    this.documentService.deleteRow( this.docId, i /* line index */);
  }

  updateText(id:string,content:string) {
    this.documentService.updateText(this.docId, id,content);
  }
 
  updateIfChanged( t: TextRow, col: number ) { 
    if (t.dirty[col]) {
	t.dirty[col] = false;
	console.log("REQ update, was dirty, DONE");
	this.updateText( t.line[col].id, t.line[col].content );
    } else {
	console.log("REQ but text was not dirty");
    }
  }
 
  insertSection(id:string) {
    this.documentService.insertSection( this.docId, id);
  }

  dragEnd(event) { 
    this.draggedText = { text: '', sourceId: '' } ;
  }

  dragStart(event,t:Text) { 
    this.draggedText = { text: t.content, sourceId: t.id } ;
  }

  myDrop(target:Text,event) { 
    target.content = this.draggedText.text; 
    this.documentService.updateText(this.docId, this.draggedText.sourceId,'');
    this.documentService.updateText(this.docId, target.id,target.content);
    this.draggedText = { text: '', sourceId: '' } ;
  }

  updateSection(id,text) {
    this.documentService.updateSection(this.docId, id,text);
  }

  deleteSection(id) {
    this.documentService.deleteSection(this.docId, id);
  }

}


