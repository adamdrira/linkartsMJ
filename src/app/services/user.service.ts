import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';
import { map } from 'rxjs/operators';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = 'api';  // URL to web api
  constructor( private http: HttpClient ) {}


  addUser (user: User): Observable<User> {
    return this.http.post<User>(this.usersUrl+'/users/signup', user, httpOptions).pipe(map(res => {
      return res;
    }));
  }

  add_link(id_user,title,link): Observable<User> {
    return this.http.post<User>(this.usersUrl+'/users/add_link', {id_user:id_user,link_title:title,link:link}, httpOptions).pipe(map(res => {
      return res;
  }));
  }
  

  check_pseudo(pseudo,index){
    return this.http.post<any>(this.usersUrl+'/users/check_pseudo', { pseudo: pseudo}).pipe(map(res => {
        return [res,index];
    }));
  }

}