import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFab,
  IonFabButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { settingsOutline, add } from 'ionicons/icons';
import { Cita, CitasService } from '../services/citas.service';
import { ConfiguracionService } from '../services/configuracion.service';
import { CitaTarjetaComponent } from '../components/cita-tarjeta/cita-tarjeta.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFab,
    IonFabButton,
    CitaTarjetaComponent
  ],
})
export class HomePage implements OnInit {
  citaActual: Cita | null = null;
  permitirBorrarInicio: boolean = false;

  constructor(
    private citasService: CitasService,
    private configService: ConfiguracionService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ settingsOutline, add });
  }

  async ngOnInit(): Promise<void> {
    await this.citasService.iniciarPlugin();
    await this.cargarDatos();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.citasService.iniciarPlugin();
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.permitirBorrarInicio = await this.configService.permitirBorrarEnInicio();
    this.citaActual = await this.citasService.obtenerCitaAleatoria();
    this.cdr.detectChanges();
  }

  async borrarCitaActual(id: number): Promise<void> {
    await this.citasService.eliminarCita(id);
    this.citaActual = await this.citasService.obtenerCitaAleatoria();
    this.cdr.detectChanges();
  }
}