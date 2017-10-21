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

	DOCUMENT_NEW_EMPTY_ROW:		'[Document] newRow',		// payload = { index: number, texts: Text[] }
	DOCUMENT_DELETE_ROW:		'[Document] deleteRow',		// payload = { index: number }
	TEXT_LOAD_ALL:			'[Text] loadAll',		// payload = Text[] 
	SECTION_LOAD_ALL:		'[Sections] loadAll',		// payload = Sections[] 
	TEXT_UPDATE:			'[Text] textUpdate', 		// payload = { id: string, content: string }
	SECTION_CREATE: 		'[Section] createSection', 	// payload = Section 
	SECTION_DELETE:			'[Section] deleteSection',	// payload = string
	SECTION_UPDATE_TITLE:		'[Section] updateSection',	// payload = { textid, title }

	// future use
	DOCUMENT_LOAD: 			'[Document] load',		// minimal payload = { id }
	DOCUMENT_CREATE: 		'[Document] create',		// minimal payload = { } 
	DOCUMENT_DELETE: 		'[Document] delete',		// minimal payload = id: string
	DOCUMENT_UPDATE_TITLE:  	'[Document] updateTitle',	// minimal payload = { id, title }

}

/**
 ** REDUCERS
 **/

const sectionReducer : ActionReducer<Section[]> = (state: Section[] = [] , action: Action) => {
  switch (action.type) {

    case DocActionTypes.SECTION_CREATE:
	return [ ...state, Object.assign({},action.payload) ];

    case DocActionTypes.SECTION_LOAD_ALL: 
	return action.payload ;  

    case DocActionTypes.SECTION_DELETE: 
	return state.filter( s => { return s.starttextid != action.payload; } );

    case DocActionTypes.SECTION_UPDATE_TITLE: 
	return state.map( s => { 
				if (s.starttextid == action.payload.textid) 
					  return Object.assign({},s,{title:action.payload.title}); 
					else 
					  return s; 
				});

    default: 
	return state;
  }
}

const textReducer : ActionReducer<Text[]>  = (state: Text[] = [], action: Action) => {

  switch (action.type) {

    case DocActionTypes.TEXT_LOAD_ALL: 
	return action.payload ;  

    case DocActionTypes.DOCUMENT_NEW_EMPTY_ROW: 
	return state.map( t => { 
				if (t.row >= action.payload.index) 
					  return Object.assign({},t,{row:t.row+1}); 
					else 
					  return t; 
			})
			.concat(action.payload.texts);

    case DocActionTypes.DOCUMENT_DELETE_ROW: 
	return state.filter( t => { return t.row != action.payload.index; } )
			.map( t => {
				if (t.row > action.payload.index) 
					  return Object.assign({},t,{row:t.row-1}); 
					else 
					  return t; 
				});

    case DocActionTypes.TEXT_UPDATE: 
	return state.map( t => { 
				if (t.id == action.payload.id) 
					  return Object.assign({},t,{content:action.payload.content}); 
					else 
					  return t; 
				});

    default: 
	return state;
  }

}

const reducers = {
  texts: textReducer,
  sections: sectionReducer
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
  sections$ : Observable<Section[]>;
  rows$ : Observable<TextRow[]>;

  constructor( private http : Http, private store: Store<AppStore> ) { 

	//
	// observable on the raw text data
	//
	this.texts$ = this.store.select('texts');	
	this.sections$ = this.store.select('sections');

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

    this.http.get('/api/sections', HEADER)
	.map( res => res.json() )
	.subscribe( sections => { this.store.dispatch( { type: DocActionTypes.SECTION_LOAD_ALL, payload: sections } ) } ); 
  }

  //
  // Add a new empty row (ie. 3 empty new Texts)
  //
  addNewEmptyRow( docId: number, currentRow: number ) {

    let row = currentRow;

    let u1 : string = uuid(); let u2 : string = uuid(); let u3 : string = uuid();

    let newTexts = [ { id: u1, docId: docId, content: '', row: row, col: 0},
    		     { id: u2, docId: docId, content: '', row: row, col: 1},
    		     { id: u3, docId: docId, content: '', row: row, col: 2} ];

    let body1 = `{ "id": "${u1}", "docId": "${docId}", "content": "", "row": ${row}, "col": 0 }`;
    let body2 = `{ "id": "${u2}", "docId": "${docId}", "content": "", "row": ${row}, "col": 1 }`;
    let body3 = `{ "id": "${u3}", "docId": "${docId}", "content": "", "row": ${row}, "col": 2 }`;

    let body = `[ ${body1}, ${body2}, ${body3} ]`;

    this.http.post(`/api/rows/${row}`, body, HEADER)
	.map( res => res.json() )
	.subscribe( texts => { this.store.dispatch( { type: DocActionTypes.DOCUMENT_NEW_EMPTY_ROW, payload: { index: row, texts: newTexts } } ) } ); 

  }

  // 
  // delete a row
  //
  deleteRow( docId: number, row: number) {
    this.http.delete(`/api/rows/${row}`, HEADER)
	.map( res => res.json() )
	.subscribe( texts => { this.store.dispatch( { type: DocActionTypes.DOCUMENT_DELETE_ROW, payload: { index: row } } ) } ); 
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
  // create a new (empty) section
  //
  insertSection( docId: number, textId: string ) {
    var newSection = { docid: docId, starttextid: textId, title: 'Section' };
    var body = JSON.stringify(newSection);
    this.http.post(`/api/sections`, body, HEADER).subscribe( res => this.store.dispatch( { type: DocActionTypes.SECTION_CREATE, payload: newSection } ) ); 
  }

  //
  // Update a section title 
  //
  updateSection( textid: string, title: string ) {
    let body = `{ "title": ${JSON.stringify(title)} }`;
    console.log(body);
    this.http.put(`/api/sections/${textid}`, body, HEADER).subscribe(); 
    this.store.dispatch( { type: DocActionTypes.SECTION_UPDATE_TITLE, payload: { textid: textid, title: title } } ); 
  }

  // 
  // delete a section 
  //
  deleteSection( starttextid: number) {
    this.http.delete(`/api/sections/${starttextid}`, HEADER)
	.map( res => res.json() )
	.subscribe( sections => { this.store.dispatch( { type: DocActionTypes.SECTION_DELETE, payload: starttextid } ) } ); 
  }

  //
  // expose Observables to components
  //
  getTexts() : Observable<Text[]> { return this.texts$; }
  getRows() : Observable<TextRow[]> { return this.rows$; }
  getSections(): Observable<Section[]> { return this.sections$; }

}

