

export function number_in_k_or_m(n: number){

    if(n<1000) {
        return String(n);
    }
    else if(n<100000) {
        return  (n/1000).toFixed(1) + "k";
    }
    else if(n<1000000000) {
        return ( n/1000000 ).toFixed(1) + "m" ;
    }

}

