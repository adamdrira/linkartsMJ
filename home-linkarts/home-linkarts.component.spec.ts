import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLinkartsComponent } from './home-linkarts.component';

describe('HomeComponent', () => {
  let component: HomeLinkartsComponent;
  let fixture: ComponentFixture<HomeLinkartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeLinkartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLinkartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
