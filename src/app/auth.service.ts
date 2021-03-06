import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
//import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';

import { environment } from '../environments/environment';

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: 'RK_5QAIJzv5nS25JhsQW2yU60RIvEW4u',
    domain: 'rose61488.eu.auth0.com',
    responseType: 'token id_token',
    audience: 'https://rose61488.eu.auth0.com/userinfo',
    redirectUri: environment.CALLBACK_URL,      
    scope: 'openid email'
  });

  constructor( public router: Router ) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication( callback? ): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/']);
	console.log("calling callback...");
	if (callback) callback();
      } else if (err) {
        this.router.navigate(['/']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    console.log("setting session with email " + authResult.idTokenPayload.email );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('auth0_expires_at', expiresAt);
    localStorage.setItem('auth0_email', authResult.idTokenPayload.email);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('auth0_expires_at');
    localStorage.removeItem('auth0_email');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    var email = localStorage['auth0_email']; 
    // Check whether the current email is set 
    if (email == null || email === undefined || email == 'undefined') return false;
    // Check whether the current time is past the access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('auth0_expires_at'));
    return new Date().getTime() < expiresAt;
  }

  public getUserEmail(): string {
    return localStorage['auth0_email']; 
  }

}

