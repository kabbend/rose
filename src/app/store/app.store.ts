
import { Text, Section, Document } from './document.model';

export interface AppStore {
  documents: Document[];
  sections: Section[];
  texts: Text[];
}


