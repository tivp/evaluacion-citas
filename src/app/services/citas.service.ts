import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface Cita {
  id?: number;
  frase: string;
  autor: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private plataforma: string = '';
  private inicializado: boolean = false;

  private readonly DB_NAME = 'citas.sqlite';
  private readonly DB_TABLE_NAME = 'citas';
  private readonly DB_ENCRIPTADA = false;
  private readonly DB_MODE = 'no-encryption';
  private readonly DB_VERSION = 1;
  private readonly DB_READ_ONLY = false;

  private readonly DB_SQL_TABLAS = `
    CREATE TABLE IF NOT EXISTS ${this.DB_TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frase TEXT NOT NULL,
      autor TEXT NOT NULL
    );
  `;

  // Semilla inicial de citas para poblar la base de datos si se encuentra vacía
  private citasSemilla: Cita[] = [
    {
      id: 1,
      frase: 'El éxito consiste en obtener lo que se desea. La felicidad en disfrutar lo que se obtiene.',
      autor: 'Ralph Waldo Emerson'
    },
    {
      id: 2,
      frase: 'Las personas no son recordadas por el número de veces que fracasan, sino por el número de veces que tienen éxito.',
      autor: 'Thomas Edison'
    },
    {
      id: 3,
      frase: 'Ningún viento es bueno para el barco que no sabe adónde va.',
      autor: 'Séneca'
    }
  ];

  constructor() {}

  private async _iniciarPluginWeb(): Promise<void> {
    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');
    if (jeepSqliteEl != null) {
      await this.sqlite.initWebStore();
    }
  }

  async iniciarPlugin(): Promise<void> {
    if (this.inicializado) {
      return;
    }
    try {
      this.plataforma = Capacitor.getPlatform();
      if (this.plataforma === 'web') {
        const timeout = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('WebStore timeout')), 600)
        );
        await Promise.race([this._iniciarPluginWeb(), timeout]);
      }
      await this.abrirConexion();
      await this.db.execute(this.DB_SQL_TABLAS);
      await this._poblarDatosIniciales();
      this.inicializado = true;
    } catch (error) {
      console.warn('Entorno web sin soporte WASM activo, operando con almacenamiento de respaldo:', error);
      this.inicializado = true;
    }
  }

  async abrirConexion(): Promise<void> {
    const ret = await this.sqlite.checkConnectionsConsistency();
    const isConn = (await this.sqlite.isConnection(this.DB_NAME, this.DB_READ_ONLY)).result;
    if (ret.result && isConn) {
      this.db = await this.sqlite.retrieveConnection(this.DB_NAME, this.DB_READ_ONLY);
    } else {
      this.db = await this.sqlite.createConnection(
        this.DB_NAME,
        this.DB_ENCRIPTADA,
        this.DB_MODE,
        this.DB_VERSION,
        this.DB_READ_ONLY
      );
    }
    await this.db.open();
  }

  private async _poblarDatosIniciales(): Promise<void> {
    const sql = `SELECT * FROM ${this.DB_TABLE_NAME}`;
    const resultado = await this.db.query(sql);
    if (!resultado?.values || resultado.values.length === 0) {
      for (const c of this.citasSemilla) {
        const insertSql = `INSERT INTO ${this.DB_TABLE_NAME}(frase, autor) VALUES(?, ?)`;
        await this.db.run(insertSql, [c.frase, c.autor]);
      }
      if (this.plataforma === 'web') {
        await this.sqlite.saveToStore(this.DB_NAME);
      }
    }
  }

  async obtenerCitas(): Promise<Cita[]> {
    if (this.db) {
      const sql = `SELECT * FROM ${this.DB_TABLE_NAME}`;
      const resultado = await this.db.query(sql);
      return resultado?.values ?? [];
    }
    return [...this.citasSemilla];
  }

  async obtenerCitaAleatoria(): Promise<Cita | null> {
    const citas = await this.obtenerCitas();
    if (citas.length === 0) {
      return null;
    }
    const indiceAleatorio = Math.floor(Math.random() * citas.length);
    return citas[indiceAleatorio];
  }

  async agregarCita(cita: Cita): Promise<void> {
    if (this.db) {
      const sql = `INSERT INTO ${this.DB_TABLE_NAME}(frase, autor) VALUES(?, ?)`;
      await this.db.run(sql, [cita.frase, cita.autor]);
      if (this.plataforma === 'web') {
        await this.sqlite.saveToStore(this.DB_NAME);
      }
      return;
    }
    const nuevoId =
      this.citasSemilla.length > 0
        ? Math.max(...this.citasSemilla.map(c => c.id ?? 0)) + 1
        : 1;
    this.citasSemilla.push({ id: nuevoId, frase: cita.frase, autor: cita.autor });
  }

  async eliminarCita(id: number): Promise<void> {
    if (this.db) {
      const sql = `DELETE FROM ${this.DB_TABLE_NAME} WHERE id = ?`;
      await this.db.run(sql, [id]);
      if (this.plataforma === 'web') {
        await this.sqlite.saveToStore(this.DB_NAME);
      }
      return;
    }
    this.citasSemilla = this.citasSemilla.filter(c => c.id !== id);
  }
}