import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({ providedIn: 'root' })

export class TempAuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Promise<boolean> {
        

        const currentUser = this.authenticationService.currentInvitedUserValue;
        console.log(currentUser)
        if ( currentUser ) {
            console.log(currentUser);
            return new Promise(resolve=>{
                this.authenticationService
                .check_invited_user()
                 .subscribe(
                    res => {
                        console.log(res);
                        if(res){
                            resolve(true);
                        }
                        else{
                            resolve(false);
                        }
                        
                 })
            })
        }
        else{
            this.router.navigate(['/login_invited_user']);
            return new Promise(resolve=>{resolve(false)})
        }
        
        /*this.router.navigate(['/login']);
        return false;*/
    }
}