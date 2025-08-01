import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-report.component.html',
  styleUrls: ['./search-report.component.css']
})
export class SearchReportComponent {
  reportes: { nombre: string, data: any }[] = [];
  filtro: string = '';

  constructor(private router: Router) {
    this.cargarReportes();
  }

  cargarReportes() {
    this.reportes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave && clave.startsWith('Reporte')) {
        const data = JSON.parse(localStorage.getItem(clave) || '{}');
        this.reportes.push({ nombre: clave, data });
      }
    }
  }

  filtrarReportes() {
    return this.reportes.filter(r =>
      r.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      r.data.some((item: any) =>
        item.name?.toLowerCase().includes(this.filtro.toLowerCase())
      )
    );
  }

  verDetalle(reporte: string) {
    localStorage.setItem('reporteSeleccionado', reporte);
    this.router.navigate(['/info-report']);
  }
  irAInfoReport(reporte: any) {
    console.log("hola");
    console.log(reporte);
  this.verDetalle(reporte.nombre);
  
  console.log('Navigate to info-report for:', reporte);
}

}
