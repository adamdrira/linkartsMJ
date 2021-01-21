import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private usersUrl = 'api';  // URL to web api
    private currentUserSubject: BehaviorSubject<string>;
    public currentUser: Observable<string>;
    private currentUserTypeSubject: BehaviorSubject<string>;
    public currentUserType: Observable<string>;
    private inviteduserSubject: BehaviorSubject<string>;
    public inviteduser: Observable<string>;
   

    constructor(private http: HttpClient, private CookieService: CookieService) {
        this.currentUserSubject = new BehaviorSubject<string>( this.CookieService.get('currentUser') );
        this.currentUser = this.currentUserSubject.asObservable();

        this.currentUserTypeSubject = new BehaviorSubject<string>('');
        this.currentUserType = this.currentUserTypeSubject.asObservable();

        this.inviteduserSubject = new BehaviorSubject<string>( this.CookieService.get('inviteduser') );
        this.inviteduser = this.inviteduserSubject.asObservable();
    }
    

    public get currentUserValue(): string {
        return this.currentUserSubject.value;
    }

    public get currentUserTypeValue(): string {
        return this.currentUserTypeSubject.value;
    }

    public get currentInvitedUserValue(): string {
        return this.inviteduserSubject.value;
    }

    login_invited_user(mail:string,password:string):Observable<any>{
        return this.http.post<any>('api/users/encrypt_data', { mail: mail, password: password }).pipe(map(r=>{
            this.CookieService.set('inviteduser', r.token, 365*10, '/','linkarts.fr',undefined,'Lax');
            this.inviteduserSubject.next(r.token);
            return r
        }))
    }

    check_invited_user(){
        return this.http.post<any>('api/users/check_invited_user', {}, {withCredentials:true}).pipe(map(res => {
            //console.log(res)
            if(res.msg=="TOKEN_OK"){
                return true
            }
            else if( res.msg == "TOKEN_REFRESH" ) {
                //this.CookieService.delete('currentUser','/');
                this.CookieService.set('inviteduser', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                return true;
            }
            else{
                return false;
            }
        }))
    }
    

    check_email_checked(username, password) {
        return this.http.post<any>('api/users/check_email_checked', { mail_or_username: username, password: password }).pipe(map(res => {
            console.log(res);
            return res
        }))

    }

    login(username, password) {
        return this.http.post<any>('api/users/login', { mail_or_username: username, password: password }).pipe(map(res => {
                console.log(res);
                if(!res.msg){
                    //console.log("reset cookie")
                    this.CookieService.set('currentUser', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                    this.currentUserSubject.next( this.CookieService.get('currentUser') );
                    this.currentUserTypeSubject.next("account");

                    let  recommendations=this.CookieService.get('recommendations');
                    if( recommendations ){
                        this.CookieService.set('visitor_recommendations', recommendations, 365*10, '/','linkarts.fr',undefined,'Lax');
                    }
                   

                }
                return res;
            }));
    }

    reset_password(mail){
        // check if mail exists and return error if no, send mail if yes
        return this.http.post<any>('api/users/reset_password', { email: mail}).pipe(map(res => {
                return res;
            }));
    }

    
    create_visitor() {
        //console.log("debut creation visitor 35");
        return this.http.post<any>('api/users/create_visitor', { })
            .pipe(map(res => {
                //console.log(res);
                this.CookieService.set('currentVisitor', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                this.CookieService.set('currentUser', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                this.currentUserSubject.next( this.CookieService.get('currentUser') );
                this.currentUserTypeSubject.next("visitor");
                return res
            }));
    }

    logout() {
        let visitor=this.CookieService.get('currentVisitor');
        //console.log(visitor);
        if(visitor){
            //console.log("dans visitor")
            //this.CookieService.delete('currentUser', '/')
            this.CookieService.set('currentUser', visitor, 365*10, '/','linkarts.fr',undefined,'Lax');
            this.currentUserSubject.next(visitor);
            this.currentUserTypeSubject.next("visitor");

            let  recommendations=this.CookieService.get('visitor_recommendations');
            if( recommendations ){
                this.CookieService.set('recommendations', recommendations, 365*10, '/','linkarts.fr',undefined,'Lax');
            }
            else{
                this.CookieService.delete('recommendations','/');
            }
        }
        else{
            //console.log("dans autre");
            this.create_visitor().subscribe(l=>{
                //console.log(l)
            });
        }
        
    }

    tokenCheck() {
        //console.log("checking token 65")
        return this.http.post<any>('api/users/checkToken', {},{withCredentials:true} )
            .pipe(map(res => {
                //console.log(res);
                if( res.msg == "TOKEN_UNKNOWN" ) {
                    //console.log("token unknown")
                    this.create_visitor().subscribe(l=>{
                        //console.log(l);
                    });
                }
                if( res.msg == "TOKEN_REFRESH" ) {
                    //this.CookieService.delete('currentUser','/');
                    this.CookieService.set('currentUser', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                    
                }
                else if(res.status=="visitor"){
                    //console.log("visitor mode");
                    if(res.token){
                        this.CookieService.set('currentVisitor', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                        this.CookieService.set('currentUser', res.token, 365*10, '/','linkarts.fr',undefined,'Lax');
                    }
                }
                this.currentUserSubject.next(this.CookieService.get('currentUser'));
                this.currentUserTypeSubject.next(res.status);
                return res.status;
            }));
    }

    

    
    
}