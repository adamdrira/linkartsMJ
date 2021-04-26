import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';
import { shareReplay, first, filter } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}
    public readonly store: Record<string, Observable<HttpEvent<any>>> = {};

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let currentUser = this.authenticationService.currentUserValue;

        if (currentUser) {
            
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentUser}`
                }
            });
        }
        else{
            currentUser="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuaWNrbmFtZSI6InZpc2l0b3IiLCJpZCI6ODAsImlhdCI6MTYxNzg0MjI2NywiZXhwIjoxNjE3ODQzMTY3fQ.OUHmNhx2pLCRNgQVZFCWMq3B1DohJJJ-hKkSV0Pq4QM"
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentUser}`
                }
            });
        }

        
        if ( request.method !== 'GET' ) {
            return next.handle(request);
        }

        /*if(this.store[request.urlWithParams]){
            console.log("cache found for : " + request.url)
            console.log( this.store[request.urlWithParams])
        }
        else{
            console.log("no cache found for : " + request.url)
        }*/
        // Check if observable is in cache, otherwise call next.handle
        const cachedObservable = this.store[request.urlWithParams] ||
        ( this.store[request.urlWithParams] = next.handle(request).pipe(
            // Filter since we are interested in caching the response only, not progress events
            filter((res) => res instanceof HttpResponse ),
            // Share replay will cache the response
            shareReplay(1),
        ));
        // pipe first() to cause the observable to complete after it emits the response
        // This mimics the behaviour of Observables returned by Angular's httpClient.get() 
        // And also makes toPromise work since toPromise will wait until the observable completes.
        return cachedObservable.pipe(first());

    }
}