import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BindingChamber } from './binding-chamber';

describe('BindingChamber', () => {
  let component: BindingChamber;
  let fixture: ComponentFixture<BindingChamber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BindingChamber]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BindingChamber);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
