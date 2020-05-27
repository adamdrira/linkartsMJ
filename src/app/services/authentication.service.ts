import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private usersUrl = 'http://localhost:4600/api';  // URL to web api
    private currentUserSubject: BehaviorSubject<string>;
    public currentUser: Observable<string>;

    constructor(private http: HttpClient, private CookieService: CookieService) {
        this.currentUserSubject = new BehaviorSubject<string>( this.CookieService.get('currentUser') );
        this.currentUser = this.currentUserSubject.asObservable();
    }
    

    public get currentUserValue(): string {
        return this.currentUserSubject.value;
    }

    login(username, password) {
        return this.http.post<any>(this.usersUrl+'/users/login', { nickname: username, password: password })
            .pipe(map(res => {
                this.CookieService.set('currentUser', res.token, 365*10, '/');
                this.currentUserSubject = new BehaviorSubject<string>( this.CookieService.get('currentUser') );
            }));
    }

    logout() {
        this.CookieService.delete('currentUser','/');
        this.currentUserSubject.next(null);
    }

    tokenCheck() {
        return this.http.post<any>(this.usersUrl+'/users/checkToken', {} )
            .pipe(map(res => {
                if( res.msg == "TOKEN_REFRESH" ) {
                    this.CookieService.delete('currentUser','/');
                    this.CookieService.set('currentUser', res.token, 365*10, '/');
                   
                }
                
            }));
    }

    get_user_id(){
        return this.http.get<any>(this.usersUrl+'/userid', {withCredentials:true} ).pipe(map(res => {
            return res
        }))
        
    }

    
    
}