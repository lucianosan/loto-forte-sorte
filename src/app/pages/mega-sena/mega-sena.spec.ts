import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MegaSena } from './mega-sena';

describe('MegaSena', () => {
  let component: MegaSena;
  let fixture: ComponentFixture<MegaSena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MegaSena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MegaSena);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
