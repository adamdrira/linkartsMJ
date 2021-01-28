import { Injectable } from '@angular/core';

@Injectable()
export class SearchbarService {


    //Status 0 for Linkarts
    //Status 1 for Linkcollab : offres et demandes de collaborations bénévoles
    //Status 2 for Linkcollab : offres de services et collaborations rémunérées
    //Status 3 for Linkcollab : annonces et offres d'emplois
    status: number;

    panels_data: any[] = [
    
        
    //************************************ */
    //************************************ */
    //Nothing for : LINKARTS
    //************************************ */
    //************************************ */
    [
        [
            {
            'opened':'0',
            'name':''
            }
        ]
    ],


    //************************************ */
    //************************************ */
    //SEARCHBAR FOR : LINKCOLLAB : collaborations benevoles
    //************************************ */
    //************************************ */
    [
        [
          {
            'opened':'0',
            'name':'Recherche de collaborations bénévoles',
            'title':"Profil de l'annonceur",
            'values': [
              {"value":"Tout", "checked":"0"},
              {"value":"Scénariste", "checked":"0"},
              {"value":"Dessinateur", "checked":"0"},
              {"value":"Graphiste", "checked":"0"},
              {"value":"Producteur son", "checked":"0"},
              {"value":"Groupe animation", "checked":"0"},
              {"value":"Groupe BD et mangas", "checked":"0"},
              {"value":"Groupe dessinateurs", "checked":"0"},
              {"value":"Groupe scénaristes", "checked":"0"}
            ]
          }
        ],
        [
            {
                'title':"Objectif de l'annonceur",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Maison d'édition", "checked":"0"},
                    {"value":"Studio d'animation", "checked":"0"},
                    {"value":"Autopublication", "checked":"0"},
                    {"value":"Personnel", "checked":"0"}
                ]
            },
            {
                'title':"Expérience de l'annonceur",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Amateur", "checked":"0"},
                    {"value":"Certifié", "checked":"0"},
                    {"value":"Professionnel certifié", "checked":"0"}  
                ]
            }
        ],
            
        [
            {
                'title':"Type de projet",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Manga", "checked":"0"},
                    {"value":"Bande dessinée", "checked":"0"},
                    {"value":"Animation", "checked":"0"},
                    {"value":"Récit illustré", "checked":"0"}
                ]
            },
            {
                'title':"Longueur du projet",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Oeuvre unique", "checked":"0"},
                    {"value":"Série courte", "checked":"0"},
                    {"value":"Série longue", "checked":"0"}
                ]
            }
        ],
        [
          {
            'title':'Profil de la cible',
            'values': [
                        {"value":"Tout", "checked":"0"},
                        {"value":"Scénariste", "checked":"0"},
                        {"value":"Dessinateur", "checked":"0"},
                        {"value":"Graphiste", "checked":"0"},
                        {"value":"Producteur son", "checked":"0"},
                        {"value":"Groupe animation", "checked":"0"},
                        {"value":"Groupe BD et mangas", "checked":"0"},
                        {"value":"Groupe dessinateurs", "checked":"0"},
                        {"value":"Groupe scénaristes", "checked":"0"}
            ]
          }
        ]
    ],

    //************************************ */
    //************************************ */
    //SEARCHBAR FOR : LINKCOLLAB : collaborations rémunérées
    //************************************ */
    //************************************ */
    [
        [
          {
            'opened':'0',
            'name':'Recherche de collaborations remunérées',
            'title':"Type d'annonce",
            'values': [
                {"value":"Offre", "checked":"0"},
                {"value":"Demande", "checked":"0"}
            ]
          },
          {
            'title':"Produit ou service",
            'values': [
              {"value":"Tout", "checked":"0"},
              {"value":"Dessin numérique", "checked":"0"},
              {"value":"Dessin traditionnel", "checked":"0"},
              {"value":"Peinture", "checked":"0"},
              {"value":"Scénario", "checked":"0"},
              {"value":"Planche de bande-dessinée", "checked":"0"},
              {"value":"Bande-son", "checked":"0"},
              {"value":"Animation", "checked":"0"},
              {"value":"Animation complète", "checked":"0"}
            ]
          }
        ],
        [
            {
                'title':"Type",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Pièce unique", "checked":"0"},
                    {"value":"Formule", "checked":"0"}
                ]
            },
            {
                'title':"Expérience de l'annonceur",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Débutant", "checked":"0"},
                    {"value":"Intermédiaire", "checked":"0"},
                    {"value":"Confirmé", "checked":"0"}  ,
                    {"value":"Professionnel certifié", "checked":"0"}  
                ]
            }
        ],
            
        [
            {
                'title':"Type d'arrangement",
                'values': [
                    {"value":"Tout", "checked":"0"},
                    {"value":"Contractuel en présentiel", "checked":"0"},
                    {"value":"Comptant en présentiel", "checked":"0"},
                    {"value":"Virement par le site", "checked":"0"}
                ]
            },
            {
                'title':"Lieu pour l'arrangement en présentiel",
                'values': [
                ]
            }
        ],
        [
          {
            'title':'Fourchette de prix',
            'values': [
                        {"value":"Tout", "checked":"0"},
                        {"value":"Jusqu'à 50€", "checked":"0"},
                        {"value":"Entre 51€ et 1000€", "checked":"0"},
                        {"value":"Plus de 1000€", "checked":"0"}
            ]
          }
        ]
    ]



    ];


    constructor() {
    }

    setStatus(i) { this.status = i; }

}