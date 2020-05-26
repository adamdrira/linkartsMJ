import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailTopOfferComponent } from './thumbnail-top-offer.component';

describe('ThumbnailTopOfferComponent', () => {
  let component: ThumbnailTopOfferComponent;
  let fixture: ComponentFixture<ThumbnailTopOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailTopOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailTopOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
