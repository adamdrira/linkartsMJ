import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAlbumDrawingComponent } from './add-album-drawing.component';

describe('AddAlbumDrawingComponent', () => {
  let component: AddAlbumDrawingComponent;
  let fixture: ComponentFixture<AddAlbumDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAlbumDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAlbumDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
