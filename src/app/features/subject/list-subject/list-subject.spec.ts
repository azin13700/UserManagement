import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSubject } from './list-subject';

describe('ListSubject', () => {
  let component: ListSubject;
  let fixture: ComponentFixture<ListSubject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSubject],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSubject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
