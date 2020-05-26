import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArtworkComponent } from './add-artwork.component';

describe('AddArtworkComponent', () => {
  let component: AddArtworkComponent;
  let fixture: ComponentFixture<AddArtworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddArtworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddArtworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
