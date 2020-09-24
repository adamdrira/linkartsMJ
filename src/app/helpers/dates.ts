
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
      else if ( s < 2629746 ) {
        if( Math.trunc(s/604800)==1 ) {
          return "Publié il y a 1 semaine";
        }
        else {
          return "Publié il y a " + Math.trunc(s/604800) + " semaines";
        }
      }
      else if ( s < 31556952  ) {
        if( Math.trunc(s/2629746)==1 ) {
          return "Publié il y a 1 mois";
        }
        else {
          return "Publié il y a " + Math.trunc(s/2629746) + " mois";
        }
      }
      else {
        if( Math.trunc(s/31556952)==1 ) {
          return "Publié il y a 1 an";
        }
        else {
          return "Publié il y a " + Math.trunc(s/31556952) + " ans";
        }
      }

}

export function get_date_to_show_chat(s: number) {
    
  if( s < 3600 ) {
      if( Math.trunc(s/60)==1 ) {
        return "1 min";
      }
      else {
        return Math.trunc(s/60) + " min";
      }
    }
    else if( s < 86400 ) {
      if( Math.trunc(s/3600)==1 ) {
        return "1 h";
      }
      else {
        return Math.trunc(s/3600) + " h";
      }
    }
    else if( s < 604800 ) {
      if( Math.trunc(s/86400)==1 ) {
        return "1 j";
      }
      else {
        return Math.trunc(s/86400) + " j";
      }
    }
    else if ( s < 2629746 ) {
      if( Math.trunc(s/604800)==1 ) {
        return "1 sem";
      }
      else {
        return  Math.trunc(s/604800) + " sem";
      }
    }
    else if ( s < 31556952 ) {
      if( Math.trunc(s/2629746)==1 ) {
        return "1 mois";
      }
      else {
        return  Math.trunc(s/2629746) + " mois";
      }
    }
    else {
      if( Math.trunc(s/31556952)==1 ) {
        return "1 an";
      }
      else {
        return Math.trunc(s/31556952) + " ans";
      }
    }

}


export function get_date_to_show_for_ad(s: number) {
  if( s < 3600 ) {
    if( Math.trunc(s/60)==1 ) {
      return "Envoyée il y a 1 minute";
    }
    else {
      return "Envoyée il y a " + Math.trunc(s/60) + " minutes";
    }
  }
  else if( s < 86400 ) {
    if( Math.trunc(s/3600)==1 ) {
      return "Envoyée il y a 1 heure";
    }
    else {
      return "Envoyée il y a " + Math.trunc(s/3600) + " heures";
    }
  }
  else if( s < 604800 ) {
    if( Math.trunc(s/86400)==1 ) {
      return "Envoyée il y a 1 jour";
    }
    else {
      return "Envoyée il y a " + Math.trunc(s/86400) + " jours";
    }
  }
  else if ( s < 2419200 ) {
    if( Math.trunc(s/604800)==1 ) {
      return "Envoyée il y a 1 semaine";
    }
    else {
      return "Envoyée il y a " + Math.trunc(s/604800) + " semaines";
    }
  }
  else if ( s < 9676800 ) {
    if( Math.trunc(s/2419200)==1 ) {
      return "Envoyée il y a 1 mois";
    }
    else {
      return "Envoyée il y a " + Math.trunc(s/2419200) + " mois";
    }
  }
  else {
    if( Math.trunc(s/9676800)==1 ) {
      return "Envoyée il y a 1 an";
    }
    else {
      return "Envoyée il y a " + Math.trunc(s/9676800) + " ans";
    }
  }
}

export function date_in_seconds(now: number, date_upload:string){
  if(date_upload){
    var uploaded_date = date_upload.substring(0,date_upload.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = Math.trunc(new Date(uploaded_date + ' GMT').getTime()/1000);

    return ( now - uploaded_date_in_second );
  }
  else{
    const uploaded_date_in_second = Math.trunc(new Date().getTime()/1000);

    return ( now - uploaded_date_in_second );
  }
    
}


