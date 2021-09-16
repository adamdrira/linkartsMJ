import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDrawingThumbnailComponent } from './edit-drawing-thumbnail.component';

describe('EditDrawingThumbnailComponent', () => {
  let component: EditDrawingThumbnailComponent;
  let fixture: ComponentFixture<EditDrawingThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDrawingThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDrawingThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
