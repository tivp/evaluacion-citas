import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private readonly KEY_BORRAR_INICIO = 'PERMITIR_BORRAR_EN_INICIO';

  constructor() {}

  async permitirBorrarEnInicio(): Promise<boolean> {
    const resultado = await Preferences.get({ key: this.KEY_BORRAR_INICIO });
    return resultado.value === 'true';
  }

  async setPermitirBorrarEnInicio(permitir: boolean): Promise<void> {
    await Preferences.set({
      key: this.KEY_BORRAR_INICIO,
      value: permitir ? 'true' : 'false'
    });
  }
}