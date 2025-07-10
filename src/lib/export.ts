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
        ["Título da Solicitação", request.title],
        ["ID da Solicitação", request.id],
        ["Criado em", new Date(request.createdAt).toLocaleDateString()],
        ["Centro de Custo", request.billing.costCenter]
    ];
    const wsRequest = utils.aoa_to_sheet(requestInfo);
    utils.book_append_sheet(wb, wsRequest, "Info da Solicitação");

    // Passengers and Itineraries
    const exportData = [];
    exportData.push(["Nome Passageiro", "CPF", "Origem", "Destino", "Data Partida", "Ida e Volta?", "Data Retorno", "Documentos"]);

    for (const passenger of request.passengers) {
        if (passenger.itinerary.length > 0) {
            for (const leg of passenger.itinerary) {
                exportData.push([
                    passenger.name,
                    passenger.cpf,
                    leg.origin,
                    leg.destination,
                    new Date(leg.departureDate).toLocaleDateString(),
                    leg.isRoundTrip ? "Sim" : "Não",
                    leg.returnDate ? new Date(leg.returnDate).toLocaleDateString() : "N/A",
                    passenger.documents.map(d => d.name).join(', ')
                ]);
            }
        } else {
             exportData.push([
                passenger.name,
                passenger.cpf,
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                passenger.documents.map(d => d.name).join(', ')
            ]);
        }
    }
    
    const wsPassengers = utils.aoa_to_sheet(exportData);
    utils.book_append_sheet(wb, wsPassengers, "Passageiros e Itinerários");
    
    writeFile(wb, `${request.title.replace(/\s+/g, '_')}.xlsx`);
}