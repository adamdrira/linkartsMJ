import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ConstantsService {

  constructor() { }


  drawings_filters=["Abstrait","Animaux","Anime & Manga","BD","Campagne","Caricatural","Cartoons","Cinéma","Comics","Culture","Décoration","Design","Enfants","Fanart","Fanfiction","Fantaisie","Femmes","Fête","Fresque","Guerre","Guerrier","Graffiti","Héroïque","Histoire","Hommes","Horreur","Humour","Immeubles","Intérieur","Maisons","Monstre","Montagnes","Motos","Nature","Nature morte","Paysage","Personnages","Portrait",
  "Réaliste","Religion","Retro","Romantique","Rural","SF","Sociologie","Sport","Transports","Urbanisme","Véhicules","Villes","Voitures","Voyage","Western"]
  writings_filters=["Action","Aventure","Caricatural","Enfants","Epique","Epistolaire","Esotérisme","Fanfiction","Fantaisie","Guerre","Héroïque","Histoire","Horreur","Humour","Journalisme","Philosophie",
  "Policier","Réaliste","Religion","Romantique","Satirique","SF","Sociologie","Sport","Thriller","Western"];
  comics_filters=["Action","Aventure","Caricatural","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kodomo","Nekketsu","Pantso shoto","Philosophie",
  "Policier","Religion","Romantique","Satirique","SF","Seinen","Shojo","Shonen","Sociologie","Sport","Thriller","Western","Yaoi","Yuri"];
  
  type_of_accounts=["Artistes","Artistes professionnels", "Artiste", "Artiste professionnel","Artiste professionnelle", "Maison d'édition",
  "Editeur","Editrice","Professionnels non artistes","Professionnel non artiste","Professionnelle non artiste","Passionné","Passionnée"];
  
  ads_types=["Bandes dessinées","BD européennes","Comics","Manga","Webtoon","Dessins","Dessin digital",
  "Dessin traditionnel","Écrits","Article","Poésie","Roman","Roman illustré","Scénario"];
  ads_targets=["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste","Tout public"];
  ads_descriptions=["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"]
  price_types_remunerated=["Annuel","CDD","CDI","Journalier","Mensuel","Par mission","Réinitialiser"]
  price_types_services=["Produits","Services","Réinitialiser"];
  offers_or_demands=["Offre","Demande","Réinitialiser"];
  
}
