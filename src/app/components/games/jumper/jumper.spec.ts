import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jumper } from './jumper';

describe('Jumper', () => {
  let component: Jumper;
  let fixture: ComponentFixture<Jumper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jumper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Jumper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
