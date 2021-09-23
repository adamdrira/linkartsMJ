import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';
import { shareReplay, first, filter, retry, retryWhen, concatMap, delay } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    retryCount=5;
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

        if ( request.method !== 'GET' || request.urlWithParams.includes("by_pseudo")) {
            if(request.urlWithParams.includes("change_content_status")){
      
                if(request.body.category.includes("omic")){
                    if(request.body.format.toLowerCase()=="serie"){
                        this.store[`routes/retrieve_private_serie_bd`]=null;
                        this.store[`routes/retrieve_bd_serie_by_id/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_bd_serie_by_id2/${request.body.publication_id}`]=null;
                       
                    }
                    else{
                        this.store[`routes/retrieve_bd_by_id/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_bd_by_id2/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_private_oneshot_bd`]=null;
                    }
                }
                else if(request.body.category.includes("rawing")){
                    if(request.body.format.toLowerCase()=="artbook"){
                        this.store[`routes/retrieve_drawing_artbook_by_id/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_drawing_artbook_by_id2/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_private_artbook_drawings`]=null;
                        
                    }
                    else{
                        this.store[`routes/retrieve_drawing_info_onepage_by_id/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_drawing_info_onepage_by_id2/${request.body.publication_id}`]=null;
                        this.store[`routes/retrieve_private_oneshot_drawings`]=null;
                    }

                }
                else{
                    this.store[`routes/retrieve_writing_information_by_id/${request.body.publication_id}`]=null;
                    this.store[`routes/retrieve_writing_information_by_id2/${request.body.publication_id}`]=null;
                    this.store[`routes/retrieve_private_writings`]=null;
                }
            }
            else if(request.urlWithParams.includes("delete_ad")){
                this.store[`routes/get_ads_by_user_id/${request.body.id_user}`]=null;
                this.store[`routes/retrieve_ad_by_id/${request.body.id}`]=null;
            }
            return next.handle(request).pipe(
                retryWhen(error => 
                  error.pipe(
                    concatMap((error, count) => {
                        if (count <= this.retryCount && (error.status == 0  || error.status ==503 || error.status ==504 ) ) {

                            return of(error);
                        }
                      return throwError(error);
                    }),
                    delay(500)
                  )
                )
              )
        }

        
        
        
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
        return cachedObservable.pipe(first()).pipe(
            retryWhen(error => 
              error.pipe(
                concatMap((error, count) => {
                    if (count <= this.retryCount && (error.status == 0  || error.status ==503 || error.status ==504 ) ) {

                        return of(error);
                    }
                  return throwError(error);
                }),
                delay(500)
              )
            )
          );

    }
}