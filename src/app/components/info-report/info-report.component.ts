import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-info-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-report.component.html',
  styleUrls: ['./info-report.component.css']
})
export class InfoReportComponent implements OnInit {
  nombreReporte: string = '';
  datos: any[] = [];

  constructor(private router: Router) {}
  ngOnInit() {
    const reporteSeleccionado = localStorage.getItem('reporteSeleccionado');
    if (reporteSeleccionado) {
      this.nombreReporte = reporteSeleccionado;
      const data = localStorage.getItem(reporteSeleccionado);
      if (data) {
        this.datos = JSON.parse(data);
      }
    }
  }

   goBack() {
    this.router.navigate(['/new-report']);
  }
}
