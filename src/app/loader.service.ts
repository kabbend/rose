import { Component, Injectable } from '@angular/core';

@Injectable()
export class LoaderService {
 
  private loading : boolean = false;

  constructor() {}

  start() {
	this.loading = true;
  }

  stop() {
	this.loading = false;
  }

  isLoading() : boolean { return this.loading; }
 
}


