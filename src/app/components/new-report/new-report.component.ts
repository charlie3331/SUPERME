import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-report.component.html',
  styleUrls: ['./new-report.component.css']
})
export class NewReportComponent {
  stock: any[] = [];
  filtro: string = '';
  seleccion: { [key: string]: number } = {};

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
          snp: Number(prod.snp),
          cantidad: 0,
          folios: [],
        };
      }

      agrupados[clave].cantidad += 1;
      agrupados[clave].folios.push(prod.folio);
    }

    this.stock = Object.values(agrupados);
  }

  aumentar(serial: string) {
    const item = this.stock.find(p => p.serial === serial);
    const seleccionadas = this.seleccion[serial] || 0;

    if (item && seleccionadas < item.cantidad) {
      this.seleccion[serial] = seleccionadas + 1;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'You cannot select more boxes than available.',
        confirmButtonText: 'OK'
      });
    }
  }

  disminuir(serial: string) {
    if (this.seleccion[serial] > 0) {
      this.seleccion[serial]--;
    }
  }

  filtrarStock() {
    return this.stock.filter(item =>
      item.name.toLowerCase().includes(this.filtro.toLowerCase()) ||
      item.serial.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  generarPDF() {
  if (Object.values(this.seleccion).every(c => c === 0)) {
    Swal.fire({
      icon: 'info',
      title: 'Nothing Selected',
      text: 'Please select at least one box before generating the report.',
      confirmButtonText: 'OK'
    });
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape' });

  // Obtener el número de reporte y aumentarlo
  let noReporte = Number(localStorage.getItem('noReporte') || '0') + 1;
  localStorage.setItem('noReporte', noReporte.toString());

  const dataReporte: any[] = [];

  // Portada mejorada
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Logo arriba centrado (ajusta la ruta y tamaño)
  const logoImg = 'logo.png'; // Cambia por tu ruta o base64 si tienes
  // Si tienes logo en base64 o url, úsalo, si no, comenta esta línea
  doc.addImage(logoImg, 'PNG', pageWidth / 2 - 25, 30, 50, 30); // logo un poco más abajo

// Texto SUPERME centrado debajo del logo
doc.setFontSize(28);
doc.setFont('helvetica', 'bold');
doc.text('SUPERME', pageWidth / 2, 80, { align: 'center' }); // bajado a 80

// Report Number centrado un poco más abajo
doc.setFontSize(18);
doc.setFont('helvetica', 'normal');
doc.text(`Report Number: ${noReporte}`, pageWidth / 2, 100, { align: 'center' }); // bajado a 100

// Fecha centrada abajo del número de reporte, en inglés
const fechaHoy = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
doc.setFontSize(14);
doc.text(`Date: ${fechaHoy}`, pageWidth / 2, 115, { align: 'center' }); // bajado a 115

  doc.addPage('landscape');

  // --- resto del código igual ---

  const rows: any[] = [];
  const productosGuardados = JSON.parse(localStorage.getItem('productosGuardados') || '[]');

  for (const item of this.stock) {
    const qty = this.seleccion[item.serial] || 0;
    if (qty > 0) {
      for (let i = 0; i < qty; i++) {
        const folio = item.folios[i] || 'N/A';
        rows.push([folio, item.serial, item.name, 1, item.snp]);
        dataReporte.push({
          folio,
          serial: item.serial,
          name: item.name,
          qty: 1,
          snp: item.snp,
        });

        // Eliminar del stock local (productosGuardados)
        const index = productosGuardados.findIndex((p: any) => p.folio === folio);
        if (index !== -1) {
          productosGuardados.splice(index, 1);
        }
      }
    }
  }

  // Actualiza el localStorage sin los productos enviados
  localStorage.setItem('productosGuardados', JSON.stringify(productosGuardados));

  // Guardar este reporte como "Reporte{n}" en localStorage
  localStorage.setItem(`Reporte${noReporte}`, JSON.stringify(dataReporte));

  // Tabla de datos
  autoTable(doc, {
    head: [['Folio', 'Serial', 'Name', 'Qty', 'SNP']],
    body: rows,
    styles: { fontSize: 10 },
    margin: { top: 20 },
  });

  // Descargar PDF
  doc.save(`Report${noReporte}.pdf`);

  // Mostrar confirmación
  Swal.fire({
    icon: 'success',
    title: 'Report Generated',
    text: `Report #${noReporte} has been generated successfully.`,
    confirmButtonText: 'OK'
  });

  // Limpiar selección y recargar stock
  this.seleccion = {};
  this.cargarStock();
}


  calcularTotalPiezas(): number {
    let total = 0;

    for (const item of this.stock) {
      const cantidadSeleccionada = this.seleccion[item.serial] || 0;
      total += cantidadSeleccionada * item.snp;
    }

    return total;
  }

  obtenerResumenSeleccion() {
    return this.stock
      .filter(item => (this.seleccion[item.serial] || 0) > 0)
      .map(item => {
        const cajas = this.seleccion[item.serial];
        return {
          name: item.name,
          serial: item.serial,
          cajas,
          piezas: cajas * item.snp
        };
      });
  }
}
