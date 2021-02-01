import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  constructor(
    public route: ActivatedRoute
    ) { }

  ngOnInit(): void {

    this.article_number = parseInt(this.route.snapshot.paramMap.get('article_number'));
    if( ! (this.article_number>=0 && this.article_number<6) ) {
      this.article_number = 1;
    }
  }

  article_number:number;


}
