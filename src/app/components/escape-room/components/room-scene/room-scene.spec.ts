import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDataService } from '../../../../services/app-data/app-data';
import { RoomScene } from './room-scene';

describe('RoomScene', () => {
  let component: RoomScene;
  let fixture: ComponentFixture<RoomScene>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomScene],
      providers: [provideHttpClient(), provideHttpClientTesting(), AppDataService],
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
