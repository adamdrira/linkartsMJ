import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkDrawingComponent } from './artwork-drawing.component';

describe('ArtworkDrawingComponent', () => {
  let component: ArtworkDrawingComponent;
  let fixture: ComponentFixture<ArtworkDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtworkDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtworkDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
