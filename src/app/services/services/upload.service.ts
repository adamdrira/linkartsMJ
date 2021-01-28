import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() {
    this.category=new BehaviorSubject(0);
    this.step=new BehaviorSubject(0);

    this.categoryObservable$ = this.category.asObservable();
    this.stepObservable$ = this.step.asObservable();

  }

  //0 : COMIC STRIP upload
  //1 : DRAWING upload
  //2 : WRITING upload
  category:BehaviorSubject<number>;
  //0 : No data has been provided. : waiting for the user to fill in the first form.
  //1 : The user filled the first step of the form : waiting for the user to fill in the second form.
  //2 : The user filled the second step of the form : waiting for the user to fill in the third form.
  step:BehaviorSubject<number>;
  //Observables
  categoryObservable$: Observable<number>;
  stepObservable$: Observable<number>;

  
  //form : category 0, step 0
  f00_validation() {
    //this.step.next( this.step.value + 1 );
  }

  f01_validation() {
    //this.step.next( this.step.value + 1 );
  }

  f02_validation() {
    //alert("upload done");
  }


  getCategoryObservable() {
    return this.categoryObservable$;
  }

  setCategory(i:number) {
    this.category.next(i);
  }
  


}
