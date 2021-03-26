
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsRoutingModule } from './terms-routing';
import { TermsComponent } from '../terms/terms.component';
import { CommonComponentsModule } from './common-components.module';




@NgModule({
  declarations: [
    TermsComponent,
  ],
  imports: [
    CommonModule,
    TermsRoutingModule,
    CommonComponentsModule,
  ]
})
export class TermsModuleModule { }
