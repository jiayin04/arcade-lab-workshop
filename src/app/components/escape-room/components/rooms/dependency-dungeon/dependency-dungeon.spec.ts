import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependencyDungeon } from './dependency-dungeon';

describe('DependencyDungeon', () => {
  let component: DependencyDungeon;
  let fixture: ComponentFixture<DependencyDungeon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependencyDungeon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DependencyDungeon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
