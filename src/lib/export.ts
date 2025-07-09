"use client"

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { utils, writeFile } from 'xlsx';
import { type TravelRequest } from '@/types';

export const exportToPNG = (element: HTMLElement | null, fileName: string) => {
  if (!element) return;
  html2canvas(element, { scale: 2 }).then((canvas) => {
    const link = document.createElement('a');
    link.download = `${fileName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
};

export const exportToPDF = (element: HTMLElement | null, fileName:string) => {
  if (!element) return;
  html2canvas(element, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const height = pdfWidth / ratio;
    
    // Check if content height is larger than page height
    if (height > pdfHeight) {
        // This simple implementation will just scale to fit, might need multi-page for very long content
        const newWidth = pdfHeight * ratio;
        pdf.addImage(imgData, 'PNG', (pdfWidth - newWidth)/2, 0, newWidth, pdfHeight);
    } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
    }

    pdf.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
  });
};

export const exportToExcel = (request: TravelRequest) => {
    const wb = utils.book_new();

    // Request Info
    const requestInfo = [
        ["Request Title", request.title],
        ["Request ID", request.id],
        ["Created At", new Date(request.createdAt).toLocaleDateString()],
        ["Cost Center", request.billing.costCenter]
    ];
    const wsRequest = utils.aoa_to_sheet(requestInfo);
    utils.book_append_sheet(wb, wsRequest, "Request Info");

    // Passengers
    const passengersData = request.passengers.map(p => ({
        Name: p.name,
        CPF: p.cpf,
        Documents: p.documents.map(d => d.name).join(', ')
    }));
    const wsPassengers = utils.json_to_sheet(passengersData);
    utils.book_append_sheet(wb, wsPassengers, "Passengers");

    // Itinerary
    const itineraryData = request.itinerary.map(i => ({
        Origin: i.origin,
        Destination: i.destination,
        Departure: new Date(i.departureDate).toLocaleString(),
        Return: i.isRoundTrip && i.returnDate ? new Date(i.returnDate).toLocaleString() : "N/A"
    }));
    const wsItinerary = utils.json_to_sheet(itineraryData);
    utils.book_append_sheet(wb, wsItinerary, "Itinerary");

    writeFile(wb, `${request.title.replace(/\s+/g, '_')}.xlsx`);
}
