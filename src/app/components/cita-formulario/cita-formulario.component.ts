import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonText
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { Cita } from '../../services/citas.service';

@Component({
  selector: 'app-cita-formulario',
  templateUrl: './cita-formulario.component.html',
  styleUrls: ['./cita-formulario.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonText
  ]
})
export class CitaFormularioComponent {
  fraseStr: string = '';
  autorStr: string = '';

  // Envía el objeto Cita ya validado hacia GestionCitasPage
  @Output() onCitaCreada = new EventEmitter<Cita>();

  constructor() {
    addIcons({ addOutline });
  }

  // Verifica que el formulario cumpla los largos mínimos antes de emitir los datos
  enviarFormulario(formulario: NgForm): void {
    const fraseLimpia = (this.fraseStr || '').trim();
    const autorLimpio = (this.autorStr || '').trim();

    if (formulario.invalid || fraseLimpia.length < 5 || autorLimpio.length < 2) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.onCitaCreada.emit({
      frase: fraseLimpia,
      autor: autorLimpio
    });

    this.fraseStr = '';
    this.autorStr = '';
    formulario.resetForm();
  }
}