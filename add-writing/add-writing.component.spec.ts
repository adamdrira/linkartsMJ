import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWritingComponent } from './add-writing.component';

describe('AddWritingComponent', () => {
  let component: AddWritingComponent;
  let fixture: ComponentFixture<AddWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
