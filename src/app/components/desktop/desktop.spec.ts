import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Desktop } from './desktop';

describe('Desktop', () => {
  let component: Desktop;
  let fixture: ComponentFixture<Desktop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Desktop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Desktop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
