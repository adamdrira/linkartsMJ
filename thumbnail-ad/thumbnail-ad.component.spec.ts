import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailAdComponent } from './thumbnail-ad.component';

describe('ThumbnailAdComponent', () => {
  let component: ThumbnailAdComponent;
  let fixture: ComponentFixture<ThumbnailAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
