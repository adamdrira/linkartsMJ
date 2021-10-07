import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Drawings_Artbook_Service } from "./drawings_artbook.service";



@Injectable({
    providedIn: 'root'
})

export class GetDrawingArtbookResolverService implements Resolve<any> {
    constructor(
        private Drawings_Artbook_Service: Drawings_Artbook_Service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let drawing_id= parseInt(route.paramMap.get('id'));
        return this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(drawing_id).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}