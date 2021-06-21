import { FormControl, FormGroup } from "@angular/forms";


let accents = "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇÅåÆæœ";
let special_characters = "\,\;\:\!\?\.\\\\§\%\>\<\^\$\€\£\*\&\~\#\{\}\'\’\"\(\)\\[\\]\|\`\@\°\+\=_-";
let special_characters2 = "\.\'\’\&\_-";
let special_characters3 = "\,\;\:\!\?\/\\\\.\%\>\<\^\*\&\#\{\}\'\’\"\(\)\\[\\]\|\@\+\=_-";
export function pattern(type: string) {
    
    if( type == "mail" ) {
        return "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";
    }
    //Minimum : une minuscule, une majuscule, un chiffre et un caractère spécial.
    if( type == "password" ) {
        return "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9"+accents+special_characters+"].{7,}";
    }
    //Doit commencer par une lettre (avec accents), doit finir par une lettre.
    //Peut contenir au milieu un espace ou un tiret (max 1).
    if( type == "name" ) {
        return "[a-zA-Z"+accents+"]\{1,}[a-zA-Z"+accents+" '’-]\{0,}[a-zA-Z "+accents+"]\{1,}";
    }
    if( type == "society" ) {
        return "[a-zA-Z0-9"+accents+"]\{1,}[a-zA-Z0-9"+accents+" '’-]\{0,}[a-zA-Z0-9 "+accents+"]\{1,}";
    }
    //alpha numérique + accents + pas plus de deux tirets ou underscore à la suite
    if( type == "nickname" ) {
        return "^(?=.*[a-zA-Z0-9"+accents+"_-])(?!.*[_-]{3})[a-zA-Z0-9"+accents+special_characters2+"_-]+([a-zA-Z0-9"+accents+special_characters2+"])$";
    }
    //alpha numérique + accents + caractères spéciaux + ne doit pas commencer ni finir par un espace
    if( type == "text" ) {
        return "^([a-zA-Z0-9"+accents+special_characters+"])[a-zA-Z0-9 "+accents+special_characters+"]+([a-zA-Z0-9 "+accents+special_characters+"])$";
    }
    if( type == "text_title" ) {
        return "^([a-zA-Z0-9"+accents+special_characters3+"])[a-zA-Z0-9 "+accents+special_characters3+"]+([a-zA-Z0-9 "+accents+special_characters3+"])$";
    }
    //alpha numérique + accents + caractères spéciaux + ne doit pas commencer ni finir par un espace
    if( type == "text_with_linebreaks" ) {
        return "^([a-zA-Z0-9"+accents+special_characters+"])[a-zA-Z0-9 \n\r"+accents+special_characters+"]+([a-zA-Z0-9 "+accents+special_characters+"])$";
    }

    //alpha numérique + accents + caractères spéciaux + ne doit pas commencer ni finir par un espace + PAS D'ESPACES
    if( type == "text_without_spaces" ) {
        return "[h][t][t][p]+([a-zA-Z0-9"+accents+special_characters+"])[a-zA-Z0-9"+accents+special_characters+"]+$";
    }

    if( type == "link" ) {
        return "^([h][t][t][p])+([a-zA-Z0-9"+accents+special_characters3+"])[a-zA-Z0-9"+accents+special_characters3+"]+$";
    }

    if( type == "siret" ) {
        return "^[0-9]{9}$";
    }
    if(type == "share") {
        return "[0-9][0-9.]*[0-9]";
    }
    if(type=="classic"){
        return "[a-zA-Z0-9"+"\,\.\_-"+"]\{1,}[a-zA-Z0-9 "+"\,\.\_-"+"]\{0,15}"
    }
    //localisation
    //Commence par lettre ou accent
    // Au milieu ", -" sont autorisés
    //Fini par lettre ou accent
    if( type == "location" ) {
        return "[a-zA-Z"+accents+"]\{1,}[a-zA-Z"+accents+" ,-]\{0,}[a-zA-Z"+accents+"]\{1,}";
    }
    //nombre entier
    if( type == "integer" ) {
        return "[0-9]*";
    }
    if( type == "integer_sup" ) {
        return "[1-9]+[0-9]*";
    }


}


export function normalize_to_nfc(fg:FormGroup, fc:string ) {

    if(!fg || !fc) {
        return;
    }
    fg.controls[fc].setValue( fg.controls[fc].value.normalize("NFC") );
}
