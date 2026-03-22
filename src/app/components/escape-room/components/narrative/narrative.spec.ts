import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Narrative } from './narrative';

describe('Narrative', () => {
  let component: Narrative;
  let fixture: ComponentFixture<Narrative>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Narrative]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Narrative);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
