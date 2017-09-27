import { Directive, EventEmitter, AfterViewInit, Output, Component, OnInit, ElementRef } from '@angular/core';


@Directive({
  selector: '[rosetextarea]',
})

export class RoseTextarea implements AfterViewInit {

  constructor ( private element : ElementRef ) {console.log(this.element);}
  @Output() focusOnMe : EventEmitter<ElementRef> = new EventEmitter<ElementRef>();
 
  ngAfterViewInit() : void { 
 	this.focusOnMe.emit(this.element.nativeElement);
  }

}


