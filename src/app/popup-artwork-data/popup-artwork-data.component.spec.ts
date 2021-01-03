import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupArtworkDataComponent } from './popup-artwork-data.component';

describe('PopupArtworkDataComponent', () => {
  let component: PopupArtworkDataComponent;
  let fixture: ComponentFixture<PopupArtworkDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupArtworkDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupArtworkDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
