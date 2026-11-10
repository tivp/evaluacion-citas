import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaTarjetaComponent } from './cita-tarjeta.component';

describe('CitaTarjetaComponent', () => {
  let component: CitaTarjetaComponent;
  let fixture: ComponentFixture<CitaTarjetaComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CitaTarjetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
