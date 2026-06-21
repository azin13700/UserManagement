import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitPage } from './unit-page';

describe('UnitPage', () => {
  let component: UnitPage;
  let fixture: ComponentFixture<UnitPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
