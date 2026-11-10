import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaFormularioComponent } from './cita-formulario.component';

describe('CitaFormularioComponent', () => {
  let component: CitaFormularioComponent;
  let fixture: ComponentFixture<CitaFormularioComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CitaFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
