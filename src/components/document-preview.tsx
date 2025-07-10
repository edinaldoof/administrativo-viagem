
"use client";

import React from "react";
import { type TravelRequest } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Plane, Building, FileText } from "lucide-react";
import RouteMap from "./route-map";

type DocumentPreviewProps = {
  request: TravelRequest | null;
};

export const DocumentPreview = React.forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ request }, ref) => {
    if (!request) {
      return (
        <div ref={ref} className="p-4 border rounded-lg bg-muted/20 flex items-center justify-center h-full">
          <p className="text-muted-foreground">Selecione uma solicitação para visualizar.</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="bg-background text-foreground p-8 rounded-lg" id="document-preview">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">{request.title}</h1>
            <p className="text-muted-foreground">Documento de Solicitação de Viagem</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">ID da Solicitação:</p>
            <p className="text-sm text-muted-foreground font-mono">{request.id}</p>
            <p className="font-semibold mt-2 text-foreground">Data:</p>
            <p className="text-sm text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
        </header>

        <Separator className="my-6" />

        <section className="mb-8">
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><User />Passageiros</h2>
          <div className="space-y-6">
            {request.passengers.map((passenger, index) => (
              <Card key={passenger.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Passageiro {index + 1}: {passenger.name}</CardTitle>
                   <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4">
                      <p><span className="font-semibold">CPF:</span> {passenger.cpf}</p>
                      <p><span className="font-semibold">Nascimento:</span> {new Date(passenger.birthDate).toLocaleDateString()}</p>
                   </div>
                </CardHeader>
                <CardContent className="pt-4">
                  
                  <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-md text-card-foreground"><Plane size={16} /> Itinerário</h4>
                      <div className="space-y-3 pl-2">
                        {passenger.itinerary?.map((segment) => (
                           <Card key={segment.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="p-4">
                                   <CardTitle className="text-base mb-2 text-card-foreground">{segment.origin} para {segment.destination}</CardTitle>
                                   <div className="text-sm space-y-1 text-muted-foreground">
                                       <p><span className="font-semibold text-card-foreground">Partida:</span> {new Date(segment.departureDate).toLocaleDateString()}</p>
                                       {segment.isRoundTrip && segment.returnDate && (
                                           <p><span className="font-semibold text-card-foreground">Retorno:</span> {new Date(segment.returnDate).toLocaleDateString()}</p>
                                       )}
                                       {segment.ciaAerea && <p><span className="font-semibold text-card-foreground">Cia Aérea:</span> {segment.ciaAerea}</p>}
                                       {segment.voo && <p><span className="font-semibold text-card-foreground">Voo:</span> {segment.voo}</p>}
                                       {segment.horarios && <p><span className="font-semibold text-card-foreground">Horários:</span> {segment.horarios}</p>}
                                   </div>
                               </div>
                               <div className="min-h-[200px] bg-muted/50">
                                  <RouteMap origin={segment.origin} destination={segment.destination} />
                               </div>
                           </Card>
                        ))}
                      </div>
                  </div>

                  {passenger.documents && passenger.documents.length > 0 && (
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-md text-card-foreground"><FileText size={16}/> Documentos Anexados:</h4>
                        <ul className="list-disc pl-7 text-sm space-y-1 text-muted-foreground">
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

        <section>
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2"><Building />Informações de Faturamento</h2>
          <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                <p><span className="font-semibold text-card-foreground">Centro de Custo:</span> {request.billing.costCenter}</p>
                {request.billing.account && <p><span className="font-semibold text-card-foreground">Conta do Projeto:</span> {request.billing.account}</p>}
                {request.billing.webId && <p><span className="font-semibold text-card-foreground">WEB ID:</span> {request.billing.webId}</p>}
                {request.billing.description && <p className="col-span-1 md:col-span-2"><span className="font-semibold text-card-foreground">Descrição:</span> {request.billing.description}</p>}
            </CardContent>
          </Card>
        </section>
        
      </div>
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";
