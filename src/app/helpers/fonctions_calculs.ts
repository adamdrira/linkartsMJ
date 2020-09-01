

export function number_in_k_or_m(n: number){

    if(n<1000) {
        return String(n);
    }
    else if(n<100000) {
        return Math.round( (n/1000) * 10) / 10 + "K";
    }
    else if(n<999999) {
        return String( parseInt( String( n/1000 ) ) + "K" );
    }
    else {
        return String( Math.round( (n/1000000) * 10) / 10 + "M" );
    }

}

