
export function get_date_to_show(s: number) {
    
    if( s < 3600 ) {
        if( Math.trunc(s/60)==1 ) {
          return "Publié il y a 1 minute";
        }
        else {
          return "Publié il y a " + Math.trunc(s/60) + " minutes";
        }
      }
      else if( s < 86400 ) {
        if( Math.trunc(s/3600)==1 ) {
          return "Publié il y a 1 heure";
        }
        else {
          return "Publié il y a " + Math.trunc(s/3600) + " heures";
        }
      }
      else if( s < 604800 ) {
        if( Math.trunc(s/86400)==1 ) {
          return "Publié il y a 1 jour";
        }
        else {
          return "Publié il y a " + Math.trunc(s/86400) + " jours";
        }
      }
      else if ( s < 2419200 ) {
        if( Math.trunc(s/604800)==1 ) {
          return "Publié il y a 1 semaine";
        }
        else {
          return "Publié il y a " + Math.trunc(s/604800) + " semaines";
        }
      }
      else if ( s < 9676800 ) {
        if( Math.trunc(s/2419200)==1 ) {
          return "Publié il y a 1 mois";
        }
        else {
          return "Publié il y a " + Math.trunc(s/2419200) + " mois";
        }
      }
      else {
        if( Math.trunc(s/9676800)==1 ) {
          return "Publié il y a 1 an";
        }
        else {
          return "Publié il y a " + Math.trunc(s/9676800) + " ans";
        }
      }

}

export function date_in_seconds(now: number, date_upload:string){

    var uploaded_date = date_upload.substring(0,date_upload.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

    return ( now - uploaded_date_in_second );
}


