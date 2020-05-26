import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaSeeMoreWritingsComponent } from './media-see-more-writings.component';

describe('MediaSeeMoreWritingsComponent', () => {
  let component: MediaSeeMoreWritingsComponent;
  let fixture: ComponentFixture<MediaSeeMoreWritingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaSeeMoreWritingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaSeeMoreWritingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
