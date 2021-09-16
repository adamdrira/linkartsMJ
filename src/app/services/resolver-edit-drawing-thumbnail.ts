import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { catchError} from "rxjs/operators";
import { Drawings_Artbook_Service } from "./drawings_artbook.service";
import { Drawings_Onepage_Service } from "./drawings_one_shot.service";



@Injectable({
    providedIn: 'root'
})

export class EditDrawingThumbnailResolver implements Resolve<any> {
    constructor(
        private Drawings_Artbook_Service: Drawings_Artbook_Service,
        private Drawings_Onepage_Service:Drawings_Onepage_Service,
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let format= route.paramMap.get('format');
        let id = parseInt(route.paramMap.get('id'));
        if(format=='artbook'){
            return this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(id).pipe(
                catchError((error) => {
                    return  [null];
                })
            );
        }
        else{
            return this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(id).pipe(
                catchError((error) => {
                    return  [null];
                })
            );
        }
      
    }
}