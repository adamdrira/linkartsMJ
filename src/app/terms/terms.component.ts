import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    private title: Title,
    private meta: Meta,

    ) { }

  ngOnInit(): void {

    this.article_number = parseInt(this.route.snapshot.paramMap.get('article_number'));
    if( ! (this.article_number>=0 && this.article_number<6) ) {
      this.article_number = 1;
    }
    
    if(this.article_number==1) {
      this.title.setTitle('Mentions légales');
      this.meta.updateTag({ name: 'description', content: "Lire les mentions légales du réseau LinkArts." });  
    }
    else if(this.article_number==2) {
      this.title.setTitle('Conditions d\'utilisation de LinkArts');
      this.meta.updateTag({ name: 'description', content: "Lire les conditions d'utilisation du réseau LinkArts." });  
    }
    else if(this.article_number==3) {
      this.title.setTitle('Politique d\'utilisation des cookies de LinkArts');
      this.meta.updateTag({ name: 'description', content: "Lire la politique d'utilisation des cookies du réseau LinkArts." });  
    }
    else if(this.article_number==4) {
      this.title.setTitle('Règles de confidentialité et de sécurité');
      this.meta.updateTag({ name: 'description', content: "Lire les règles de confidentialité et de sécurité du réseau LinkArts." });  
    }
    else if(this.article_number==5) {
      this.title.setTitle('Politique d\'utilisation des données');
      this.meta.updateTag({ name: 'description', content: "Lire la politique d'utilisation des données du réseau LinkArts" });  
    }
    else {
      this.title.setTitle('LinkArts – BD, Dessins et Ecrits');
      this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié aux artistes et professionnels du monde de l'édition.  Le site répond avant tout au besoin de collaboration de promotion et de rémunération des artistes et professionnels de l'édition." });
    }
  }

  article_number:number;


}
