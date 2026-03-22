import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomScene } from './room-scene';

describe('RoomScene', () => {
  let component: RoomScene;
  let fixture: ComponentFixture<RoomScene>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomScene]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomScene);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
