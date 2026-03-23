import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, of, shareReplay, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenData: any = null;
  private tokenRequest$: Observable<any> | null = null;

  
  private readonly CLIENT_ID = environment.camunda.clientId;
  private readonly CLIENT_SECRET = environment.camunda.clientSecret;


    getToken(): Observable<string> {
    // 1. If we have a valid cached token, return it as an observable string
    if (this.tokenData && !this.isTokenExpired()) {
        return of(this.tokenData.access_token);
    }

    // 2. If a request is already in progress, return that request
    if (this.tokenRequest$) {
        return this.tokenRequest$;
    }

    const body = new HttpParams()
        .set('grant_type', 'client_credentials')
        .set('audience', 'zeebe.camunda.io')
        .set('client_id', this.CLIENT_ID)
        .set('client_secret', this.CLIENT_SECRET);

    // 3. Create the request and map it to JUST the string 'access_token'
    this.tokenRequest$ = this.http.post<any>('/auth/oauth/token', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
        tap(res => {
        // Store the full response for expiration checking
        this.tokenData = {
            ...res,
            expiration: Date.now() + res.expires_in * 1000
        };
        }),
        map(res => res.access_token), // Transform the full object into a string here
        shareReplay(1),
        tap(() => this.tokenRequest$ = null) // Reset the request tracker after completion
    );

    return this.tokenRequest$;
    }

  private isTokenExpired(): boolean {
    return !this.tokenData || Date.now() > (this.tokenData.expiration - 10000);
  }
}