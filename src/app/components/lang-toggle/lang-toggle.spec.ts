import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangToggle } from './lang-toggle';

describe('LangToggle', () => {
  let component: LangToggle;
  let fixture: ComponentFixture<LangToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangToggle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
