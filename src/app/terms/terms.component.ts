import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    ) {

      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };
     }

    article_number:number;
    ngOnInit(): void {

      this.article_number = parseInt(this.route.snapshot.paramMap.get('article_number'));
      if( ! (this.article_number>0 && this.article_number<6) ) {
        this.article_number = 1;
      }
    }




}
