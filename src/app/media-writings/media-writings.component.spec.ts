import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaWritingsComponent } from './media-writings.component';

describe('MediaWritingsComponent', () => {
  let component: MediaWritingsComponent;
  let fixture: ComponentFixture<MediaWritingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaWritingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaWritingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
