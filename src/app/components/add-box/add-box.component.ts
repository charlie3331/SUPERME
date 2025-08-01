import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-box',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-box.component.html',
  styleUrls: ['./add-box.component.css']
})
export class AddBoxComponent {
  serialInput: string = '';
  producto: any = null;
  noEncontrado = false;
  qty: number | null = null;

  constructor(private http: HttpClient) {}

  buscarProducto(event?: any) {
  if (event) event.preventDefault();

  if (!this.serialInput.trim()) return;

  this.http.get<any[]>('https://myous.free.beeceptor.com/products').subscribe(data => {
    const encontrado = data.find(p => p.serial === this.serialInput.trim());
    if (encontrado) {
      this.producto = { ...encontrado };
      this.noEncontrado = false;
    } else {
      this.producto = null;
      this.noEncontrado = true;

      Swal.fire({
        icon: 'error',
        title: 'Product not found',
        text: `No product found with serial "${this.serialInput.trim()}"`,
        confirmButtonText: 'OK',
        
      });
    }
  });
}


  enviarProducto() {
    if (!this.producto || !this.qty || this.qty <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid input',
        text: 'Please select a product and enter a valid quantity.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const year = new Date().getFullYear().toString().slice(-2);
    let folioCounter = Number(localStorage.getItem('folio') || '0');
    const productosGuardados = JSON.parse(localStorage.getItem('productosGuardados') || '[]');

    const nuevosProductos: any[] = [];

    for (let i = 0; i < this.qty; i++) {
      folioCounter++;
      const folio = `${this.producto.serial}-${this.producto.snp}${year}-${String(folioCounter).padStart(2, '0')}`;
      const nuevoProducto = {
        ...this.producto,
        folio,
        fecha: new Date().toISOString()
      };
      productosGuardados.push(nuevoProducto);
      nuevosProductos.push(nuevoProducto);
    }

    localStorage.setItem('folio', folioCounter.toString());
    localStorage.setItem('productosGuardados', JSON.stringify(productosGuardados));

    // Generar PDF automáticamente
    this.generarPDF(nuevosProductos);

    Swal.fire({
      icon: 'success',
      title: 'Products saved',
      text: `${this.qty} products have been saved successfully.`,
      confirmButtonText: 'OK'
    });

    // Reiniciar formulario
    this.serialInput = '';
    this.producto = null;
    this.qty = null;
    this.noEncontrado = false;
  }

  generarPDF(productos: any[]) {
  const doc = new jsPDF({ orientation: 'landscape' });

  productos.forEach((p, index) => {
    if (index !== 0) doc.addPage();

    // Título
    doc.setFontSize(25);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Report', 20, 40);

    // Información del producto
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${p.name}`, 20, 75);
    doc.text(`Serial: ${p.serial}`, 20, 90);
    doc.text(`SNP: ${p.snp}`, 20, 105);
    doc.text(`Folio: ${p.folio}`, 20, 120);
    doc.text(`Date: ${new Date(p.fecha).toLocaleString()}`, 20, 135);

    // Función para generar código de barras como imagen
    const generateBarcodeImage = (text: string): string => {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, text, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: false,
      });
      return canvas.toDataURL('image/png');
    };

    const barcodeY = 155;
    const barcodeXStart = 50;
    const barcodeSpacing = 90;

    // Serial
    doc.addImage(generateBarcodeImage(p.serial), 'PNG', barcodeXStart-30, barcodeY, 80, 20);
    doc.text('Serial', barcodeXStart + 10, barcodeY + 30, { align: 'center' });

    // SNP
    doc.addImage(generateBarcodeImage(p.snp), 'PNG', barcodeXStart + barcodeSpacing-30, barcodeY, 80, 20);
    doc.text('SNP', barcodeXStart + barcodeSpacing + 10, barcodeY + 30, { align: 'center' });

    // Folio
    doc.addImage(generateBarcodeImage(p.folio), 'PNG', barcodeXStart-30 + barcodeSpacing * 2, barcodeY, 80, 20);
    doc.text('Folio', barcodeXStart + barcodeSpacing * 2 + 10, barcodeY + 30, { align: 'center' });

    // Logo (opcional)
    const logoUrl = 'logo.png';
    doc.addImage(logoUrl, 'PNG', 150, 10, 100, 100);
  });

  const pdfUrl = doc.output('bloburl');
  window.open(pdfUrl, '_blank');
}

}
