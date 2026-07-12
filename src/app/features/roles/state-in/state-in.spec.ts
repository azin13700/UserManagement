import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateIn } from './state-in';

describe('StateIn', () => {
  let component: StateIn;
  let fixture: ComponentFixture<StateIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateIn],
    }).compileComponents();

    fixture = TestBed.createComponent(StateIn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
