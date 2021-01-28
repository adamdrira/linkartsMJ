import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
    private usersUrl = 'api';  // URL to web api

    constructor( private http: HttpClient ) {
        
    }
    
    checkMail (mail_adress: string): Observable<string> {
        return this.http.post<string>(this.usersUrl+'/users/checkMail', {mail: mail_adress}, httpOptions);
    }
    

    
}