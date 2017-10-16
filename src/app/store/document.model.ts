
export interface Text {

 id: string;		// uuid
 docId: string;		// document which it belongs to 
 sectionId?: string;	// section which it belongs to (none if document has no section)
 content : string;	// actual text content
 row: number;		// index in the timeline (starting at 0)
 col: number;		// index column (starting at 0)
 
}

export interface Section {
 id : string;		// uuid
 docid: string;		// document it belongs to
 title : string;	// title of the section
 starttextid: string;	// first text of the section within the document (might be 0) 
}

export interface Document {
 id : string;		// uuid
 title : string;	// title of the document
}

export interface TextRow {
  id: string;		// uuid
  line: Text[];		// array of (three) Texts
}

export interface Line {
  section?: Section,
  text: TextRow
}


