import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsubjectPage } from './subsubject-page';

describe('SubsubjectPage', () => {
  let component: SubsubjectPage;
  let fixture: ComponentFixture<SubsubjectPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsubjectPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SubsubjectPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
