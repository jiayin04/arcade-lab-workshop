import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugRunner } from './debug-runner';

describe('DebugRunner', () => {
  let component: DebugRunner;
  let fixture: ComponentFixture<DebugRunner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugRunner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugRunner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
