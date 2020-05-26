import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkcollabOfferComponent } from './linkcollab-offer.component';

describe('LinkcollabOfferComponent', () => {
  let component: LinkcollabOfferComponent;
  let fixture: ComponentFixture<LinkcollabOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkcollabOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkcollabOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
