import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ConstantsService {

  constructor() { }


  drawings_filters=["Abstrait","Animaux","Animés","Architecture","Art","Botanique","BD","Campagne","Caricatural","Cartoons","Cinéma","Comics","Culture","Décoration","Design","Enigmatique","Enfants","Fanart","Fanfiction","Fantaisie","Femmes","Fête","Fresque","Guerre","Guerrier","Graffiti","Héroïque","Histoire","Hommes","Horreur","Humour","Immeubles","Intérieur","Kawaii","Maisons",
  "Mangas","Monstre","Montagnes","Motos","Nature","Nature morte","Paysage","Personnages","Photographie","Portrait",
  "Réaliste","Religion","Retro","Romantique","Rural","SF","Sociologie","Spatial","Sport","Survie","Transports","Urbanisme","Véhicules","Villes","Voitures","Voyage","Western"]
  writings_filters=["Action","Animaux","Animés","Art","Aventure","Autobiographie","BD","Caricatural","Cartoons","Comics","Enigmatique","Enfants","Epique","Epistolaire","Esotérisme","Fanfiction","Fantaisie","Guerre","Héroïque","Histoire","Horreur","Humour","Journalisme","Mangas","Pensées","Philosophie","Polar",
  "Policier","Réaliste","Réflexions","Religion","Romantique","Satirique","SF","Sociologie","Spatial","Spiritualité","Sport","Survie","Thriller","Voyage","ebtoon","Western"];
  comics_filters=["Action","Animaux","Art","Aventure","Biographie","Caricatural","Enigmatique","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kawaii","Kodomo","Nekketsu","Pantso shoto","Philosophie","Photographie",
  "Policier","Religion","Romantique","Satirique","SF","Seinen","Shojo","Shonen","Sociologie","Spatial","Sport","Survie","Thriller","Voyage","Western","Yaoi","Yuri"];
  
  type_of_accounts=["Artistes","Artistes professionnels", "Artiste", "Artiste professionnel","Artiste professionnelle", "Maison d'édition",
  "Editeur","Editrice","Professionnels non artistes","Professionnel non artiste","Professionnelle non artiste","Passionné","Passionnée"];
  
  ads_types=["Tout","Bandes dessinées","BD européennes","Comics","Manga","Webtoon","Dessins","Dessin digital",
  "Dessin traditionnel","Écrits","Article","Poésie","Roman","Roman illustré","Scénario"];
  ads_targets=["Tout","Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste","Tout public"];
  ads_descriptions=["Tout","Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"]
  price_types_remunerated=["Tout","Annuel","CDD","CDI","Journalier","Mensuel","Par mission"]
  price_types_services=["Tout","Produits","Services"];
  offers_or_demands=["Tout","Offre","Demande"];
  
}
