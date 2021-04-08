import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor( private route: ActivatedRoute, private router: Router, private CookieService: CookieService) {

    let cook = this.CookieService.get('currentUser')
    if(!cook){
      this.CookieService.set('currentUser', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuaWNrbmFtZSI6InZpc2l0b3IiLCJpZCI6ODAsImlhdCI6MTYxNzg0MjI2NywiZXhwIjoxNjE3ODQzMTY3fQ.OUHmNhx2pLCRNgQVZFCWMq3B1DohJJJ-hKkSV0Pq4QM", 365*10, '/','www.linkarts.fr',true,'Lax');
    }
    
  }



}