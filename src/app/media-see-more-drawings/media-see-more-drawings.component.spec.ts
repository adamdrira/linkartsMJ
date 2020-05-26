import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaSeeMoreDrawingsComponent } from './media-see-more-drawings.component';

describe('MediaSeeMoreDrawingsComponent', () => {
  let component: MediaSeeMoreDrawingsComponent;
  let fixture: ComponentFixture<MediaSeeMoreDrawingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaSeeMoreDrawingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaSeeMoreDrawingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
