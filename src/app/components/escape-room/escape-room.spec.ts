import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscapeRoom } from './models/escape-room';

describe('EscapeRoom', () => {
  let component: EscapeRoom;
  let fixture: ComponentFixture<EscapeRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscapeRoom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscapeRoom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
