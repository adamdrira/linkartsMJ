import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailDrawingComponent } from './thumbnail-drawing.component';

describe('ThumbnailDrawingComponent', () => {
  let component: ThumbnailDrawingComponent;
  let fixture: ComponentFixture<ThumbnailDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
