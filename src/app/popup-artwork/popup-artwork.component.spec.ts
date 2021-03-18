import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupArtworkComponent } from './popup-artwork.component';

describe('PopupArtworkComponent', () => {
  let component: PopupArtworkComponent;
  let fixture: ComponentFixture<PopupArtworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupArtworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupArtworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
