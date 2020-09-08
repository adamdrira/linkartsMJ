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
    private currentUserTypeSubject: BehaviorSubject<string>;
    public currentUserType: Observable<string>;
   

    constructor(private http: HttpClient, private CookieService: CookieService) {
        this.currentUserSubject = new BehaviorSubject<string>( this.CookieService.get('currentUser') );
        this.currentUser = this.currentUserSubject.asObservable();
        this.currentUserTypeSubject = new BehaviorSubject<string>('');
        this.currentUserType = this.currentUserTypeSubject.asObservable();
    }
    

    public get currentUserValue(): string {
        return this.currentUserSubject.value;
    }

    public get currentUserTypeValue(): string {
        return this.currentUserTypeSubject.value;
    }

    login(username, password) {
        return this.http.post<any>(this.usersUrl+'/users/login', { mail_or_username: username, password: password })
            .pipe(map(res => {
                console.log(res);
                if(!res.msg){
                    console.log("reset cookie")
                    this.CookieService.set('currentUser', res.token, 365*10, '/','localhost',undefined,'Lax');
                    this.currentUserSubject.next( this.CookieService.get('currentUser') );
                }
                return res;
            }));
    }

    reset_password(mail){
        // check if mail exists and return error if no, send mail if yes
        return this.http.post<any>('/users/login', { mail_or_username: mail})
            .pipe(map(res => {
                console.log(res);
                return res;
            }));
    }

    create_visitor() {
        console.log("debut creation visitor 35");
        return this.http.post<any>(this.usersUrl+'/users/create_visitor', { })
            .pipe(map(res => {
                console.log(res);
                this.CookieService.set('currentVisitor', res.token, 365*10, '/','localhost',undefined,'Lax');
                this.CookieService.set('currentUser', res.token, 365*10, '/','localhost',undefined,'Lax');
                this.currentUserSubject.next( this.CookieService.get('currentUser') );
                this.currentUserTypeSubject.next("visitor");
                return res
            }));
    }

    logout() {
        let visitor=this.CookieService.get('currentVisitor');
        console.log(visitor);
        if(visitor){
            console.log("dans visitor")
            //this.CookieService.delete('currentUser', '/')
            this.CookieService.set('currentUser', visitor, 365*10, '/','localhost',undefined,'Lax');
            this.currentUserSubject.next(visitor);
        }
        else{
            console.log("dans autre");
            this.create_visitor().subscribe(l=>{
                console.log(l)
            });
        }
        
    }

    tokenCheck() {
        console.log("checking token 65")
        return this.http.post<any>(this.usersUrl+'/users/checkToken', {},{withCredentials:true} )
            .pipe(map(res => {
                console.log(res);
                if( res.msg == "TOKEN_UNKNOWN" ) {
                    console.log("token unknown")
                    this.create_visitor().subscribe(l=>{
                        console.log(l);
                    });
                }
                if( res.msg == "TOKEN_REFRESH" ) {
                    //this.CookieService.delete('currentUser','/');
                    this.CookieService.set('currentUser', res.token, 365*10, '/','localhost',undefined,'Lax');
                }
                else if(res.status=="visitor"){
                    console.log("visitor mode");
                    if(res.token){
                        this.CookieService.set('currentVisitor', res.token, 365*10, '/','localhost',undefined,'Lax');
                        this.CookieService.set('currentUser', res.token, 365*10, '/','localhost',undefined,'Lax');
                    }
                }
                this.currentUserSubject.next(this.CookieService.get('currentUser'));
                this.currentUserTypeSubject.next(res.status);
                return res.status;
            }));
    }

    

    
    
}