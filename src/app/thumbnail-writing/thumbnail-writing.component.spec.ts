import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailWritingComponent } from './thumbnail-writing.component';

describe('ThumbnailWritingComponent', () => {
  let component: ThumbnailWritingComponent;
  let fixture: ComponentFixture<ThumbnailWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
