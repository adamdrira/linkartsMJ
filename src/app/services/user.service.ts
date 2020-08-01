import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = 'http://localhost:4600/api';  // URL to web api
  constructor( private http: HttpClient ) {}

  /*
  getUsers (): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.customersUrl)
  }

  getUser(id: number): Observable<Customer> {
    const url = `${this.customersUrl}/${id}`;
    return this.http.get<Customer>(url);
  }*/

  addUser (user: User): Observable<User> {
    return this.http.post<User>(this.usersUrl+'/users/signup', user, httpOptions);
  }

  add_link(id_user,title,link): Observable<User> {
    return this.http.post<User>(this.usersUrl+'/users/add_link', {id_user:id_user,link_title:title,link:link}, httpOptions);
  }
  /*
  deleteUser (customer: Customer | number): Observable<Customer> {
    const id = typeof customer === 'number' ? customer : customer.id;
    const url = `${this.customersUrl}/${id}`;

    return this.http.delete<Customer>(url, httpOptions);
  }

  updateUser (user: User): Observable<any> {
    return this.http.put(this.customersUrl, customer, httpOptions);
  }*/
}