"use client";

import React from "react";
import { type TravelRequest } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Plane, Building, FileText } from "lucide-react";

type DocumentPreviewProps = {
  request: TravelRequest | null;
};

export const DocumentPreview = React.forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ request }, ref) => {
    if (!request) {
      return (
        <div ref={ref} className="p-4 border rounded-lg bg-slate-50 flex items-center justify-center h-full">
          <p className="text-muted-foreground">Selecione uma solicitação para visualizar.</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="bg-white text-black p-8 rounded-lg shadow-lg" id="document-preview">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">{request.title}</h1>
            <p className="text-muted-foreground">Documento de Solicitação de Viagem</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">ID da Solicitação:</p>
            <p className="text-sm text-gray-600 font-mono">{request.id}</p>
            <p className="font-semibold mt-2">Data:</p>
            <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
        </header>

        <Separator className="my-6" />

        <section className="mb-8">
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><User />Passageiros</h2>
          <div className="space-y-4">
            {request.passengers.map((passenger, index) => (
              <Card key={passenger.id} className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Passageiro {index + 1}: {passenger.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><span className="font-semibold">CPF:</span> {passenger.cpf}</p>
                  {passenger.documents && passenger.documents.length > 0 && (
                     <div className="mt-2">
                        <p className="font-semibold">Documentos Anexados:</p>
                        <ul className="list-disc pl-5 text-sm">
                           {passenger.documents.map((doc, i) => <li key={i}>{doc.name}</li>)}
                        </ul>
                     </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><Plane />Itinerário</h2>
           <div className="space-y-4">
            {request.itinerary.map((segment, index) => (
              <Card key={segment.id} className="bg-gray-50">
                 <CardHeader>
                  <CardTitle className="text-lg">Trecho {index + 1}: {segment.origin} para {segment.destination}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><span className="font-semibold">Partida:</span> {new Date(segment.departureDate).toLocaleString()}</p>
                    {segment.isRoundTrip && segment.returnDate && (
                         <p><span className="font-semibold">Retorno:</span> {new Date(segment.returnDate).toLocaleString()}</p>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <Separator className="my-6" />

        <section>
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><Building />Informações de Faturamento</h2>
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
                <p><span className="font-semibold">Centro de Custo:</span> {request.billing.costCenter}</p>
            </CardContent>
          </Card>
        </section>
        
      </div>
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";
