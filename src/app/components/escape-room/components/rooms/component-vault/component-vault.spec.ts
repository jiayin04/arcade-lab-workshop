import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentVault } from './component-vault';

describe('ComponentVault', () => {
  let component: ComponentVault;
  let fixture: ComponentFixture<ComponentVault>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentVault]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentVault);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
