import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePage } from './role-page';

describe('RolePage', () => {
  let component: RolePage;
  let fixture: ComponentFixture<RolePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePage],
    }).compileComponents();

    fixture = TestBed.createComponent(RolePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
