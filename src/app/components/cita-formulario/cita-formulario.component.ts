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

  @Output() onCitaCreada = new EventEmitter<Cita>();

  constructor() {
    addIcons({ addOutline });
  }

  enviarFormulario(formulario: NgForm): void {
    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.onCitaCreada.emit({
      frase: this.fraseStr.trim(),
      autor: this.autorStr.trim()
    });

    formulario.resetForm();
  }
}