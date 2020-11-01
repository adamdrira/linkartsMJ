import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailSkeletonComponent } from './thumbnail-skeleton.component';

describe('ThumbnailSkeletonComponent', () => {
  let component: ThumbnailSkeletonComponent;
  let fixture: ComponentFixture<ThumbnailSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
