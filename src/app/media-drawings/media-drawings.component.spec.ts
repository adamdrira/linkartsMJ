import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaDrawingsComponent } from './media-drawings.component';

describe('MediaDrawingsComponent', () => {
  let component: MediaDrawingsComponent;
  let fixture: ComponentFixture<MediaDrawingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaDrawingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDrawingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
