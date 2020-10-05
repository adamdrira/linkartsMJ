

let accents = "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇÅåÆæœ";
let special_characters = "\\\\,\;\:\!\?\.\/\§\%\^\$\£\*\&\~\#\{\}\'\"\(\)\\[\\]\|\`\@\°\+\=_-";


export function pattern(type: string) {
    
    if( type == "mail" ) {
        return "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";
    }
    //Minimum : une minuscule, une majuscule, un chiffre et un caractère spécial.
    if( type == "password" ) {
        return "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z\d$@$!%*?&_].{7,}";
    }
    //Doit commencer par une lettre (avec accents), doit finir par une lettre.
    //Peut contenir au milieu un espace ou un tiret (max 1).
    if( type == "name" ) {
        return "[a-zA-Z"+accents+"]\{1,}[ -]\{0,1}[a-zA-Z"+accents+"]\{1,}";
    }
    //alpha numérique + accents + pas plus de deux tirets ou underscore à la suite
    if( type == "nickname" ) {
        return "^(?=.*[a-zA-Z0-9"+accents+"_-])(?!.*[_-]{3})[a-zA-Z0-9"+accents+"_-]+(?<![])$";
    }
    //alpha numérique + accents + caractères spéciaux + ne doit pas commencer ni finir par un espace
    if( type == "text" ) {
        return "^([a-zA-Z0-9"+accents+special_characters+"])[a-zA-Z0-9 "+accents+special_characters+"]+(?<![ ])$";
    }
    //alpha numérique + accents + caractères spéciaux + ne doit pas commencer ni finir par un espace + PAS D'ESPACES
    if( type == "text_without_spaces" ) {
        return "^[http]+([a-zA-Z0-9"+accents+special_characters+"])[a-zA-Z0-9"+accents+special_characters+"]+$";
    }

    if( type == "siret" ) {
        return "^[0-9]{14}$";
    }
    if(type == "share") {
        return "^[0-9](\.[0-9]+)?$";
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


}




