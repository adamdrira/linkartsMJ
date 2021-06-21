import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ConstantsService {

  constructor() { }


  drawings_filters=["Abstrait","Animaux","Animés","Architecture","Art","Botanique","BD","Campagne","Caricatural","Cartoons","Cinéma","Comics","Culture","Décoration","Design","Enigmatique","Enfants","Fanart","Fanfiction","Fantaisie","Femmes","Fête","Fresque","Guerre","Guerrier","Graffiti","Héroïque","Histoire","Hommes","Horreur","Humour","Immeubles","Intérieur","Kawaii","Maisons",
  "Mangas","Monstre","Montagnes","Motos","Nature","Nature morte","Paysage","Personnages","Photographie","Portrait",
  "Réaliste","Religion","Retro","Romantique","Rural","SF","Sociologie","Spatial","Sport","Survie","Transports","Urbanisme","Véhicules","Villes","Voitures","Voyage","Western"]
  writings_filters=["Action","Animaux","Animés","Art","Aventure","Autobiographie","BD","Caricatural","Cartoons","Comics","Drame","Enigmatique","Enfants","Epique","Epistolaire","Esotérisme","Fanfiction","Fantaisie","Guerre","Héroïque","Histoire","Horreur","Humour","Journalisme","Mangas","Pensées","Philosophie","Polar",
  "Policier","Réaliste","Réflexions","Religion","Romantique","Satirique","SF","Sociologie","Spatial","Spiritualité","Sport","Survie","Thriller","Voyage","Webtoon","Western"];
  comics_filters=["Action","Animaux","Art","Aventure","Biographie","Caricatural","Drame","Enigmatique","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kawaii","Kodomo","Nekketsu","Pantso shoto","Philosophie","Photographie","Polar","Policier","Religion","Romantique","Satirique","SF","Seinen","Shojo","Shonen","Sociologie","Spatial","Sport","Survie","Thriller","Voyage","Western","Yaoi","Yuri"];
  
  type_of_accounts=["Artiste","Éditeur","Fan"];
  
  ads_types=["Tout","Bandes dessinées","BD européennes","Comics","Manga","Webtoon","Dessins","Dessin digital",
  "Dessin traditionnel","Écrits","Article","Poésie","Roman","Roman illustré","Scénario"];
  ads_targets=["Tout","Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste","Tout public"];
  ads_descriptions=["Tout","Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"]
  price_types_remunerated=["Tout","Annuel","CDD","CDI","Journalier","Mensuel","Par mission"]
  price_types_services=["Tout","Produits","Services"];
  offers_or_demands=["Tout","Offre","Demande"];

  list_of_categories=["Articles","BD","Comics","Mangas","Livres","Livres jeunesses"];
  list_of_skills=[
  "Articles", "Articles de presse", "Articles historiques", "Articles philosophiques/sociologiques", 
  "Articles scientifiques", "Articles sportifs", 
  
  "Coloriage feutre", "Coloriage graphique",

  "Dessin BD", "Dessin Comics", "Dessin Mangas", "Dessin Science fiction", "Dessin action/combat", 
  "Dessin architectural", "Dessin arme", "Dessin au crayon", "Dessin caricatural", "Dessin colorié", 
  "Dessin d'horreur", "Dessin de mouvements", "Dessin digital", "Dessin encre de Chine", "Dessin enfants", 
  "Dessin fantaisie", "Dessin feutre", "Dessin gore", "Dessin guerre","Dessin kawai", "Dessin ludique", 
  "Dessin lumières & ombres", "Dessin noir & blanc", "Dessin paysage", "Dessin pers. fiction", 
  "Dessin pers. réaliste", "Dessin personnages", "Dessin portrait", "Dessin pour adulte", 
  "Dessin romantique", "Dessin rural", "Dessin réaliste", "Dessin sketch", "Dessin traditionnel", 
  "Dessin urbain", "Dessin vectoriel", "Dessin véhicules",
  
  "Écrit Science fiction", "Écrit ados", "Écrit autobiographique", "Écrit aventure", "Écrit de guerre", 
  "Écrit dramatique", "Écrit enfants", "Écrit historique", "Écrit horreur", "Écrit héroïque", 
  "Écrit mystérieux", "Écrit nouvelles", "Écrit nouvelles", "Écrit pensées & réflexions", 
  "Écrit philosophique", "Écrit polar", "Écrit policier", "Écrit poésie", "Écrit religieux", 
  "Écrit romans", "Écrit romantique", "Écrit réaliste", "Écrit spirituel", "Écrit suspens", 
  "Écrit voyage", "Écrit éducatif", "Écrit épistolaire", "Écrit ésotérique", "Écrit adulte", 
  
  "Scénario", "Scénario BD", "Scénario Comics", "Scénario Mangas", "Scénario Science fiction", "Scénario action/combat", 
  "Scénario ados", "Scénario adulte", "Scénario aventure", "Scénario de guerre", "Scénario de survie", 
  "Scénario dramatique", "Scénario enfants", "Scénario fanfiction", "Scénario fantaisie", 
  "Scénario historique", "Scénario horreur", "Scénario humoristique", "Scénario héroïque", 
  "Scénario intergalactiques", "Scénario mystique", "Scénario mystérieux", "Scénario philosophique", 
  "Scénario policier", "Scénario religieux", "Scénario romantique", "Scénario réaliste", 
  "Scénario satirique", "Scénario seinen", "Scénario shojo", "Scénario shônen", "Scénario sociologique", 
  "Scénario spirituel", "Scénario sport", "Scénario suspens", "Scénario voyage", "Scénario western", 
  "Scénario éducatif", "Scénario énigmatique", "Scénario épiques", "Scénario ésotérique",
  
  "Software Clip Studio Paint", "Software Adobe", "Software Adobe After Effects", 
  "Software Adobe Creative Cloud tools", "Software Adobe Illustrator", "Software Adobe Photoshop", 
  "Software Astute Phantasm", "Software IOS", "Software Linux", "Software Microsoft Office", 
  "Software Procreate", "Software Ron’s Brushes", "Software Windows", "Story-board","Tablette graphique"]

  list_of_genres=["Action","Ados","Adultes","Animaliés","Art","Aventure","Autobiographie","BD",
  "Caricatural","Comics","Drame","Educatif","Enigmatique","Enfants","Epique","Epistolaire",
  "Esotérisme","Fanfiction","Fantaisie","Guerre","Héroïque","Historique","Horreur","Humoristique",
  "Journalisme","Kawai","Ludique","Mangas","Mystère","Nouvelles","Pensées","Philosophie","Polar","Policier",
  "Réaliste","Réflexions","Religion","Romans","Romantique","Satirique","Science fiction","Seinen","Shojo",
  "Shônen","Sociologie","Spatial","Spiritualité","Sport","Survie","Thriller","Voyage","Webtoon","Western"]
  
}
