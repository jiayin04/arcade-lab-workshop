import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalCore } from './signal-core';

describe('SignalCore', () => {
  let component: SignalCore;
  let fixture: ComponentFixture<SignalCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalCore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalCore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
