import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lotofacil } from './lotofacil';

describe('Lotofacil', () => {
  let component: Lotofacil;
  let fixture: ComponentFixture<Lotofacil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lotofacil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lotofacil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
