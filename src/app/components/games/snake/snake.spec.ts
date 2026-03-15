import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Snake } from './snake';

describe('Snake', () => {
  let component: Snake;
  let fixture: ComponentFixture<Snake>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Snake]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Snake);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
