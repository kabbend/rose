import { Component, EventEmitter, Input, Output, ElementRef, OnChanges, SimpleChange, AfterViewInit } 	 from '@angular/core';

import { Section, Line } from './store/document.model';

import { DocumentService } from './store/document.service';

@Component({
  selector: 'section-item',
  template: `  
		<div class="thirteen wide column" style="position:relative;width:95%;">
		<div id="{{line.section.starttextid}}" class="ui fluid input"> 
  		  <input type="text" #box (keyup.enter)="updateSection(line.text.line[0].id, box.value)" [value]="line.section.title" >
		</div>
		</div>
	    `,
  styleUrls: ["../../node_modules/font-awesome/css/font-awesome.min.css",
    "../../node_modules/primeng/resources/primeng.min.css",
    "../../node_modules/primeng/resources/themes/omega/theme.css",
    './app.component.css',
    '../assets/Semantic-UI-CSS-master/semantic.min.css'],
})

export class SectionComponent {

  @Input() line: Line;
  @Input() scrollY: number;

  offsetTop: number;

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['scrollY']) {
	if (this.scrollY + 70 > this.offsetTop ) {
		this.element.nativeElement.style.position = 'fixed'; 
		this.element.nativeElement.style.top = '70px'; 
		this.element.nativeElement.style.width = '95%'; 
		}
	else {
		this.element.nativeElement.style.position = 'relative'; 
		this.element.nativeElement.style.top = '0px'; 
		}
	
    }
  }

  constructor(private documentService: DocumentService, private element: ElementRef ) {
  }

  ngAfterViewInit() { 
	this.offsetTop = this.element.nativeElement.getBoundingClientRect().top
  }

  updateSection(id,text) {
    this.documentService.updateSection(id,text);
  }

}


