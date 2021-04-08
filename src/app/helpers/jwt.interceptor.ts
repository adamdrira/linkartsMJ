import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

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
        return next.handle(request);
    }
}