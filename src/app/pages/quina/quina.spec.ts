import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quina } from './quina';

describe('Quina', () => {
  let component: Quina;
  let fixture: ComponentFixture<Quina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
