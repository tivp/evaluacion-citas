import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent
} from '@ionic/angular';
import { Cita, CitasService } from '../../services/citas.service';
import { CitaFormularioComponent } from '../../components/cita-formulario/cita-formulario.component';
import { CitaListaComponent } from '../../components/cita-lista/cita-lista.component';

@Component({
  selector: 'app-gestion-citas',
  templateUrl: './gestion-citas.page.html',
  styleUrls: ['./gestion-citas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    CitaFormularioComponent,
    CitaListaComponent
  ]
})
export class GestionCitasPage implements OnInit {
  listaCitas: Cita[] = [];

  constructor(
    private citasService: CitasService,
    private cdr: ChangeDetectorRef
  ) {}

  // Asegura que el plugin esté iniciado y carga todas las citas al abrir la página
  async ngOnInit(): Promise<void> {
    await this.citasService.iniciarPlugin();
    await this.actualizarLista();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.citasService.iniciarPlugin();
    await this.actualizarLista();
  }

  // Trae los registros desde SQLite y actualiza la vista para el *ngFor del hijo
  async actualizarLista(): Promise<void> {
    this.listaCitas = await this.citasService.obtenerCitas();
    this.cdr.detectChanges();
  }

  // Escucha el evento @Output del formulario hijo para guardar la nueva cita
  async agregarNuevaCita(nuevaCita: Cita): Promise<void> {
    await this.citasService.agregarCita(nuevaCita);
    await this.actualizarLista();
  }

  // Escucha el evento @Output de la lista hija para borrar la cita por su id
  async eliminarCita(id: number): Promise<void> {
    await this.citasService.eliminarCita(id);
    await this.actualizarLista();
  }
}