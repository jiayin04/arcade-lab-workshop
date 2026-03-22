import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeDrop } from './code-drop';

describe('CodeDrop', () => {
  let component: CodeDrop;
  let fixture: ComponentFixture<CodeDrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeDrop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeDrop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
