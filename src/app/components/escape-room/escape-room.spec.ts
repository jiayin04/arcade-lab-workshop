import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDataService } from '../../services/app-data/app-data';
import { EscapeRoom } from './escape-room';

describe('EscapeRoom', () => {
  let component: EscapeRoom;
  let fixture: ComponentFixture<EscapeRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscapeRoom],
      providers: [provideHttpClient(), provideHttpClientTesting(), AppDataService],
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
