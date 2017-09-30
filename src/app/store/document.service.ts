import { Injectable } from '@angular/core';
import { ActionReducer, Action, Store, State, combineReducers } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Http, Headers, Response } from '@angular/http';

import { uuid } from '../util/uuid';
import { Text, TextRow, Section, Document } from './document.model';
import { AppStore } from './app.store';

const HEADER = { headers: new Headers({ 'cache': 'false', 'Content-Type': 'application/json' }) };

/**
 ** ACTIONS
 **/

export const DocActionTypes = {

	DOCUMENT_LOAD: 			'[Document] load',		// minimal payload = { id }

	DOCUMENT_CREATE: 		'[Document] create',		// minimal payload = { } 
	DOCUMENT_DELETE: 		'[Document] delete',		// minimal payload = id: string
	DOCUMENT_UPDATE_TITLE:  	'[Document] updateTitle',	// minimal payload = { id, title }

	DOCUMENT_NEW_EMPTY_ROW:		'[Document] newRow',		// minimal payload = Text[]
	DOCUMENT_DELETE_ROW:		'[Document] deleteRow',		// minimal payload = { id, row }

	SECTION_CREATE: 		'[Section] createSection', 	// minimal payload = { docId, start }
	SECTION_DELETE:			'[Section] deleteSection',	// minimal payload = id: string
	SECTION_UPDATE_TITLE:		'[Section] updateSection',	// minimal payload = { id, title }

	TEXT_LOAD_ALL:			'[Text] loadAll',		// minimal payload = Text[] 
	TEXT_CREATE:			'[Text] textCreate', 		// minimal payload = { docId, row, col }
	TEXT_UPDATE:			'[Text] textUpdate', 		// minimal payload = { id, content }
	TEXT_DELETE:			'[Text] textDelete', 		// minimal payload = id: string

}


export class DocumentDeleteRowAction implements Action {
  type = DocActionTypes.DOCUMENT_DELETE_ROW;
  constructor(public payload: { id: string, row:number }) { }
}

export class DocumentNewEmptyRowAction implements Action {
  type = DocActionTypes.DOCUMENT_NEW_EMPTY_ROW;
  constructor(public payload: Text[] ) { }
}

export class DocumentUpdateTitleAction implements Action {
  type = DocActionTypes.DOCUMENT_UPDATE_TITLE;
  constructor(public payload: { id:string, title:string} ) { }
}

export class DocumentDeleteAction implements Action {
  type = DocActionTypes.DOCUMENT_DELETE;
  constructor(public payload: string) { }
}


export class DocumentCreateAction implements Action {
  type = DocActionTypes.DOCUMENT_CREATE;
  constructor(public payload: { id?: string, title?: string, sectionIds?: string[], textIds?: string[] } ) {}
}

export class SectionUpdateTitleAction implements Action {
  type = DocActionTypes.SECTION_UPDATE_TITLE;
  constructor(public payload: { id:string, title:string } ) { }
}

export class SectionCreateAction implements Action {
  type = DocActionTypes.SECTION_CREATE;
  constructor(public payload: { id?: string, title?: string, docId: string, start: number, end?: number }) { }
}

export class SectionDeleteAction implements Action {
  type = DocActionTypes.SECTION_DELETE;
  constructor(public payload: string ) { }
}

export class TextCreateAction implements Action {
  type = DocActionTypes.TEXT_CREATE;
  constructor(public payload: { id?: string, content?: string, docId: string, sectionId?: string, row, col: number }) { }
}

export class TextUpdateAction implements Action {
  type = DocActionTypes.TEXT_UPDATE;
  constructor(public payload: { id: string, content: string } ) { }
}

export class TextDeleteAction implements Action {
  type = DocActionTypes.TEXT_DELETE;
  constructor(public payload: string ) { }
}

export class TextLoadAllAction implements Action {
  type = DocActionTypes.TEXT_LOAD_ALL;
  constructor(public payload: Text[]) { }
}

export type DocActions =
  DocumentCreateAction |
  DocumentDeleteAction |
  DocumentUpdateTitleAction |
  DocumentNewEmptyRowAction |
  DocumentDeleteRowAction |
  TextLoadAllAction |
  TextCreateAction |
  TextDeleteAction |
  TextUpdateAction |
  SectionUpdateTitleAction |
  SectionDeleteAction |
  SectionCreateAction ;

/**
 ** REDUCERS
 **/


//let initialTextState = [ { id: "1", content: "hello", docId: "1", row: 0, col: 0 } ] ;	
let initialTextState = [] ;	

const textReducer : ActionReducer<Text[]>  = (state: Text[] = initialTextState, action: Action) => {

switch (action.type) {

    case DocActionTypes.TEXT_LOAD_ALL: return action.payload ;  

    case DocActionTypes.DOCUMENT_NEW_EMPTY_ROW: return [...state, ...action.payload ] ;

    case DocActionTypes.TEXT_UPDATE: 
	return state.map( t => { 
				if (t.id == action.payload.id) 
					  return Object.assign({},t,{content:action.payload.content}); 
					else 
					  return t; 
				} 
			);

    default: return state;
  }

}

const reducers = {
  texts: textReducer
};

const productionReducer = combineReducers(reducers);

export function reducer(state: any, action: any) {
    return productionReducer(state, action);
}

/*
 * SERVICE
 */
@Injectable()
export class DocumentService {

  texts$ : Observable<Text[]>;
  rows$ : Observable<TextRow[]>;

  constructor( private http : Http, private store: Store<AppStore> ) { 

	//
	// observable on the raw text data
	//
	this.texts$ = this.store.select('texts');	

	//
	// observable on text data, but reorganize individual texts into rows (from Text[] to TextRow[]) 
	// based on Text.row, Text.col values
	//
	// Each TextRow receives:
	// - an uid made of concatenation of its texts uids in the same order
	// - a copy of the Text objects, so subsequent observers can mutate them directly
	//
	// We return rows as they come from the source Text[], meaning that no check or default values are
	// applied for "missing" text cells or duplicates  
	//
	this.rows$ = this.texts$.map( 
					// create rows
					value => value.reduce( 
						function (r, a) {
							r[a.row] = r[a.row] || [];
				  			r[a.row].line = r[a.row].line || [];
        			  			r[a.row].line[a.col] = Object.assign({},a);
        			  			return r; } , 
						[] ))
				.map(
					// compute uuid on each row
					res => res.map( row =>  { return { id: `${row.line[0].id}${row.line[1].id}${row.line[2].id}` , line: row.line } as TextRow } ) 
				);

  }	

  //
  // Initial text load, here on JSON server
  //
  loadAllTexts() {
    this.http.get('/api/texts', HEADER)
	.map( res => res.json() )
	.subscribe( texts => { this.store.dispatch( { type: DocActionTypes.TEXT_LOAD_ALL, payload: texts } ) } ); 
  }

  //
  // Add a new empty row (ie. 3 empty new Texts)
  //
  addNewEmptyRow( docId: number, currentRow: number ) {

    let u1 : string = uuid(); let u2 : string = uuid(); let u3 : string = uuid();
    let row = currentRow + 1;

    let newTexts = [ { id: u1, docId: docId, content: 'new', row: row, col: 0},
    		     { id: u2, docId: docId, content: 'new', row: row, col: 1},
    		     { id: u3, docId: docId, content: 'new', row: row, col: 2} ];

    let body1 = `{ "id": "${u1}", "docId": "${docId}", "content": "new", "row": ${row}, "col": 0 }`;
    let body2 = `{ "id": "${u2}", "docId": "${docId}", "content": "new", "row": ${row}, "col": 1 }`;
    let body3 = `{ "id": "${u3}", "docId": "${docId}", "content": "new", "row": ${row}, "col": 2 }`;

    // FIXME with transactional design
    this.http.post('/api/texts/', body1, HEADER).subscribe(); 
    this.http.post('/api/texts/', body2, HEADER).subscribe();
    this.http.post('/api/texts/', body3, HEADER).subscribe();

    this.store.dispatch( { type: DocActionTypes.DOCUMENT_NEW_EMPTY_ROW, payload: newTexts } ); 

  }

  //
  // Update a text
  //
  updateText( id: string, content: string ) {
    let body = `{ "content": ${JSON.stringify(content)} }`;
    console.log(body);
    this.http.put(`/api/texts/${id}`, body, HEADER).subscribe(); 
    this.store.dispatch( { type: DocActionTypes.TEXT_UPDATE, payload: { id: id, content: content } } ); 
  }

  //
  // expose Observables to components
  //
  getTexts() : Observable<Text[]> { return this.texts$; }
  getRows() : Observable<TextRow[]> { return this.rows$; }

}

