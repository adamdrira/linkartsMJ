import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentOfferComponent } from './content-offer.component';

describe('ContentOfferComponent', () => {
  let component: ContentOfferComponent;
  let fixture: ComponentFixture<ContentOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
