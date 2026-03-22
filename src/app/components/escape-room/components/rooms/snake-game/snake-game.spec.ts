import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeGame } from './snake-game';

describe('SnakeGame', () => {
  let component: SnakeGame;
  let fixture: ComponentFixture<SnakeGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnakeGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnakeGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
