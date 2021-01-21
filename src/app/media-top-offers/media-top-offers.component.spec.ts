import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTopOffersComponent } from './media-top-offers.component';

describe('MediaTopOffersComponent', () => {
  let component: MediaTopOffersComponent;
  let fixture: ComponentFixture<MediaTopOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaTopOffersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaTopOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
