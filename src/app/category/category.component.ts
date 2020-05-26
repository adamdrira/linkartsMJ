import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  
  
  categoryName:any;

  ngOnInit() {

    



    var Routes_Array = [
      ["bd_mangas", "bd", "Bandes dessinées"],
      ["bd_mangas", "mini_bd", "Mini bandes dessinées"],
      ["bd_mangas", "mangas", "Mangas"],
      ["bd_mangas", "mini_mangas", "Mini mangas"],
      ["animations", "animations_courtes", "Animations courtes"],
      ["animations", "animations_longues", "Animations longues"],
      ["peintures_et_dessins", "contenu_recommande", "Peintures et dessins recommandés"],
      ["peintures_et_dessins", "dessins_numeriques", "Dessins numériques"],
      ["peintures_et_dessins", "dessins_traditionnels", "Dessins traditionnels"],
      ["peintures_et_dessins", "peintures", "Peintures"],
      ["peintures_et_dessins", "street_art", "Street-art"],
      ["peintures_et_dessins", "making_of", "Making-of"],
      ["ecrits", "nouvelles_illustrees", "Nouvelles illustrées"],
      ["ecrits", "pitchs", "Pitchs"],
      ["ecrits", "poemes", "Poèmes"],
      ["ecrits", "articles", "Articles"],
    ];


    this.route.params.subscribe(params => {
      
      for (var i = 0, c = Routes_Array.length; i < c; i++) {

        if( params.category === Routes_Array[i][0] && params.subcategory === Routes_Array[i][1] ){
          this.categoryName = Routes_Array[i][2];
          break;
        }
        
    }



    });




  }

}
