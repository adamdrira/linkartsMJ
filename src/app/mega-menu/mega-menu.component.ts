import { Component, OnInit, Renderer2 } from '@angular/core';
import {ElementRef, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import {trigger, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-mega-menu',
  templateUrl: './mega-menu.component.html',
  styleUrls: ['./mega-menu.component.scss'],  
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('200ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1})
        ])
      ]
    )
  ]
})

export class MegaMenuComponent implements OnInit {

  categories_data: any[] = [
    
      {
        'category':'Animations',
        'opened':'0',
        'subcategories': [
          {"name":"Animations", "id_panel":"0"},
          {"name":"Making-of", "id_panel":"1"}
        ]
      },
      {
        'category':'BD et mangas',
        'opened':'0',
        'subcategories': [
          {"name":"Mangas", "id_panel":"2"},
          {"name":"Bandes dessinées", "id_panel":"3"},
          {"name":"Mini histoires", "id_panel":"4"},
          {"name":"Romans illustrés", "id_panel":"5"},
        ]
      },
      {
        'category':'Peintures et dessins',
        'opened':'0',
        'subcategories': [
          {"name":"Peintures", "id_panel":"6"},
          {"name":"Dessins", "id_panel":"7"},
          {"name":"Art urbain", "id_panel":"8"}
        ]
      },
      {
        'category':'Écrits',
        'opened':'0',
        'subcategories': [
          {"name":"test", "id_panel":"9"},
          {"name":"test", "id_panel":"10"},
          {"name":"test", "id_panel":"11"}
        ]
      }
    

  ];

  panels_data: any[] = [

    [
      [
        {
          'opened':'0',
          'title':'Type',
          'values': [
            {"value":"Tous les types", "checked":"0"},
            {"value":"Dessins dynamiques", "checked":"0"},
            {"value":"Animations numériques", "checked":"0"},
            {"value":"Animations traditionnelles", "checked":"0"},
            {"value":"Autre", "checked":"0"}
          ]
        }
      ],
      [
        {
          'title':'Genre',
          'values': [
                      {"value":"Tous les genres", "checked":"0"},
                      {"value":"Action", "checked":"0"},
                      {"value":"Apocalyptique", "checked":"0"},
                      {"value":"Aventure", "checked":"0"},
                      {"value":"Caricatural", "checked":"0"},
                      {"value":"Humoristique", "checked":"0"},
                      {"value":"Dramatique", "checked":"0"},
                      {"value":"Epique", "checked":"0"},
                      {"value":"Engagé", "checked":"0"},
                      {"value":"Espionnage", "checked":"0"},
                      {"value":"Fantastique", "checked":"0"},
                      {"value":"Fantasy", "checked":"0"},
                      {"value":"Gangsters", "checked":"0"},
                      {"value":"Magie", "checked":"0"}
                    ]
        }
      ],
      [
        {
          'title':' ',
          'values': [
                      {"value":"Guerre", "checked":"0"},
                      {"value":"Historique", "checked":"0"},
                      {"value":"Horreur", "checked":"0"},
                      {"value":"Philosophique", "checked":"0"},
                      {"value":"Réaliste", "checked":"0"},
                      {"value":"Romance", "checked":"0"},
                      {"value":"Scientifique", "checked":"0"},
                      {"value":"Science-fiction", "checked":"0"},
                      {"value":"Sociétal", "checked":"0"},
                      {"value":"Sports", "checked":"0"},
                      {"value":"Thriller", "checked":"0"},
                      {"value":"Western", "checked":"0"},
                      {"value":"Policier", "checked":"0"}        
          ]
        }
      ],
      [
        {
          'title':'Format',
          'values': [
                      {"value":"Série courte", "checked":"0"},
                      {"value":"Série longue", "checked":"0"},
                      {"value":"Unique court", "checked":"0"},
                      {"value":"Unique long", "checked":"0"}
          ]
        },    
        {
          'title':'Profil',
          'values': [
                      {"value":"Vérifié", "checked":"0"},
                      {"value":"Amateur", "checked":"0"}
          ]
        },
        {
          'title':'Tri',
          'values': [
                      {"value":"Tendances", "checked":"0"},
                      {"value":"Coups de cœur", "checked":"0"},
                      {"value":"Nouveauté", "checked":"0"}
          ]
        }

      ]
    ],
    [
      [
        {
          'opened':'0',
          'title':'Type',
          'values': [
            {"value":"Tous les types", "checked":"0"},
            {"value":"Dessins dynamiques", "checked":"0"},
            {"value":"Animations numériques", "checked":"0"},
            {"value":"Animations traditionnelles", "checked":"0"},
            {"value":"Autre", "checked":"0"}
          ]
        }
      ],
      [
        {
          'title':'Genre',
          'values': [
                      {"value":"Tous les genres", "checked":"0"},
                      {"value":"Action", "checked":"0"},
                      {"value":"Apocalyptique", "checked":"0"},
                      {"value":"Aventure", "checked":"0"},
                      {"value":"Caricatural", "checked":"0"},
                      {"value":"Humoristique", "checked":"0"},
                      {"value":"Dramatique", "checked":"0"},
                      {"value":"Epique", "checked":"0"},
                      {"value":"Engagé", "checked":"0"},
                      {"value":"Espionnage", "checked":"0"},
                      {"value":"Fantastique", "checked":"0"},
                      {"value":"Fantasy", "checked":"0"},
                      {"value":"Gangsters", "checked":"0"},
                      {"value":"Magie", "checked":"0"}
                    ]
        }
      ],
      [
        {
          'title':' ',
          'values': [
                      {"value":"Guerre", "checked":"0"},
                      {"value":"Historique", "checked":"0"},
                      {"value":"Horreur", "checked":"0"},
                      {"value":"Philosophique", "checked":"0"},
                      {"value":"Réaliste", "checked":"0"},
                      {"value":"Romance", "checked":"0"},
                      {"value":"Scientifique", "checked":"0"},
                      {"value":"Science-fiction", "checked":"0"},
                      {"value":"Sociétal", "checked":"0"},
                      {"value":"Sports", "checked":"0"},
                      {"value":"Thriller", "checked":"0"},
                      {"value":"Western", "checked":"0"},
                      {"value":"Policier", "checked":"0"}        
          ]
        }
      ],
      [
        {
          'title':'Format',
          'values': [
                      {"value":"Série courte", "checked":"0"},
                      {"value":"Série longue", "checked":"0"},
                      {"value":"Unique court", "checked":"0"},
                      {"value":"Unique long", "checked":"0"}
          ]
        },    
        {
          'title':'Profil',
          'values': [
                      {"value":"Vérifié", "checked":"0"},
                      {"value":"Amateur", "checked":"0"}
          ]
        },
        {
          'title':'Tri',
          'values': [
                      {"value":"Tendances", "checked":"0"},
                      {"value":"Coups de cœur", "checked":"0"},
                      {"value":"Nouveauté", "checked":"0"}
          ]
        }

      ]
    ]


  ];

  panels_pictures: any[] =[
    
    [
      {'path':''},

    ]
    
  

  ];
  

  constructor(private rd: Renderer2) {}


  ngAfterViewInit() {
    console.log(this.rd); 



  }

  open_subcategory(i) {
    this.close_all();
    this.categories_data[i].opened=1;
  }

  close_subcategory(i) {
    this.categories_data[i].opened=0;
  }

  open_panel(i) {
    this.close_all_panels();
    this.panels_data[i][0][0].opened=1;
  }

  click_checkbox(i0, i1, i2, i3) {
    if( this.panels_data[i0][i1][i2].values[i3].checked == 1 ) {
      this.panels_data[i0][i1][i2].values[i3].checked=0;
    }
    else {
      this.panels_data[i0][i1][i2].values[i3].checked=1;
    }
  }

  close_all_panels() {
    for(let i of this.panels_data) {
      i[0][0].opened=0;
    }
  }
  
  close_all() {
    
    for(let i of this.panels_data) {
      i[0][0].opened=0;
    }
    for(let i of this.categories_data) {
      i.opened=0;
    }
  }



  ngOnInit() {
  }

}
