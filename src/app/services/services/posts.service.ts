import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class PostsService {

  constructor(private httpClient: HttpClient) {}

  getAllPosts() {
    return this.httpClient.get('routes/posts').pipe(map((posts)=>{
      return posts;
    }));
  }
}
