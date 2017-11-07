import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
//import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';

import { environment } from '../environments/environment';

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: 'iUq88ocmRv47MItEKy6WLdUQdyNZ0_93',
    domain: 'fast-atoll-61488.auth0.com',
    responseType: 'token id_token',
    audience: 'https://fast-atoll-61488.auth0.com/userinfo',
    redirectUri: environment.CALLBACK_URL,      
    scope: 'openid'
  });

  constructor( public router: Router ) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/']);
      } else if (err) {
        this.router.navigate(['/error']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    console.log("setting session with id " + authResult.idToken + " & expire " + expiresAt );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('auth0_expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('auth0_expires_at');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('auth0_expires_at'));
    console.log("isAuth called, response " + expiresAt );
    return new Date().getTime() < expiresAt;
  }

}

