import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent {
  stock: any[] = [];

  constructor() {
    this.cargarStock();
  }

  cargarStock() {
    const productos = JSON.parse(localStorage.getItem('productosGuardados') || '[]');

    const agrupados: { [key: string]: any } = {};

    for (const prod of productos) {
      const clave = `${prod.serial}_${prod.snp}`;
      if (!agrupados[clave]) {
        agrupados[clave] = {
          name: prod.name,
          serial: prod.serial,
          snp: Number(prod.snp),   // Aseguramos que snp sea número
          cantidad: 0,
          ultimaFecha: prod.fecha,
          pzs: 0                    // Inicializamos pzs
        };
      }

      agrupados[clave].cantidad += 1;

      // Actualiza la última fecha si es más reciente
      if (new Date(prod.fecha) > new Date(agrupados[clave].ultimaFecha)) {
        agrupados[clave].ultimaFecha = prod.fecha;
      }

      // Calcula pzs = snp * cantidad
      agrupados[clave].pzs = agrupados[clave].snp * agrupados[clave].cantidad;
    }

    this.stock = Object.values(agrupados);
  }
}
