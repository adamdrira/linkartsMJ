import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDrawingComponent } from './add-drawing.component';

describe('AddDrawingComponent', () => {
  let component: AddDrawingComponent;
  let fixture: ComponentFixture<AddDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
