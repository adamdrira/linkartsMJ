import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private location:Location,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Promise<boolean> {
        

        const currentUser = this.authenticationService.currentUserValue;
        if ( currentUser ) {
            console.log(currentUser);
            return new Promise(resolve=>{
                this.authenticationService
                .tokenCheck()
                 .subscribe(
                    (status:any) => {
                        console.log(status);
                        if(status=="account" || status=="suspended"){
                            resolve(true);
                        }
                        else if(status=="visitor"){
                            resolve(false);
                        }
                        
                 })
            })
        }
        else{
            console.log(false)
            return new Promise(resolve=>{resolve(false)})
          
        }
        
        /*this.router.navigate(['/login']);
        return false;*/
    }
}