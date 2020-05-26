import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarLinkartsComponent } from './navbar-linkarts.component';

describe('NavbarLinkartsComponent', () => {
  let component: NavbarLinkartsComponent;
  let fixture: ComponentFixture<NavbarLinkartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarLinkartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarLinkartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
