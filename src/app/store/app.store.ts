
import { Text, Section, Document } from './document.model';

export interface AppStore {
  document: Document;
  sections: Section[];
  texts: Text[];
}


