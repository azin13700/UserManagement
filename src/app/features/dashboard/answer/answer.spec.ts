import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Answer } from './answer';

describe('Answer', () => {
  let component: Answer;
  let fixture: ComponentFixture<Answer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Answer],
    }).compileComponents();

    fixture = TestBed.createComponent(Answer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
