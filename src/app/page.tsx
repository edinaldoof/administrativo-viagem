"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Users,
  Calendar,
  Plane,
  Download,
  FileUp,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RequestForm } from "@/components/request-form";
import { DocumentPreview } from "@/components/document-preview";
import { type TravelRequest } from "@/types";
import { getRequests, saveRequests } from "@/lib/actions";
import { Logo } from "@/components/logo";
import { exportToPNG, exportToPDF, exportToExcel } from "@/lib/export";

export default function Home() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const previewRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRequests(getRequests());
  }, []);

  const handleSaveRequests = (updatedRequests: TravelRequest[]) => {
    saveRequests(updatedRequests);
    setRequests(updatedRequests);
  };

  const openFormForNew = () => {
    setSelectedRequest(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (request: TravelRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const openPreview = (request: TravelRequest) => {
    setSelectedRequest(request);
    setIsPreviewOpen(true);
  };
  
  const confirmDelete = (id: string) => {
    setRequestToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (!requestToDelete) return;
    const updatedRequests = requests.filter((r) => r.id !== requestToDelete);
    handleSaveRequests(updatedRequests);
    toast({ title: "Sucesso", description: "Solicitação excluída com sucesso." });
    setIsAlertOpen(false);
    setRequestToDelete(null);
  };

  const handleDuplicate = (request: TravelRequest) => {
    const newRequest: TravelRequest = {
      ...JSON.parse(JSON.stringify(request)), // Deep copy
      id: crypto.randomUUID(),
      title: `${request.title} (Cópia)`,
      createdAt: new Date(),
    };
    handleSaveRequests([...requests, newRequest]);
    toast({ title: "Sucesso", description: "Solicitação duplicada com sucesso." });
  };
  
  const handleFormSubmit = (data: TravelRequest) => {
    const updatedRequests = selectedRequest
      ? requests.map((r) => (r.id === selectedRequest.id ? data : r))
      : [...requests, data];
    handleSaveRequests(updatedRequests);
    toast({ title: "Sucesso", description: `Solicitação ${selectedRequest ? 'atualizada' : 'criada'} com sucesso.` });
    setIsFormOpen(false);
    setSelectedRequest(null);
  };
  
  const getMainItinerary = (request: TravelRequest) => {
    const firstPassenger = request.passengers[0];
    if (!firstPassenger || !firstPassenger.itinerary || firstPassenger.itinerary.length === 0) {
      return 'N/A';
    }
    return firstPassenger.itinerary.map(i => i.origin).join(', ');
  }

  const getPassengerInfo = (request: TravelRequest) => {
    if (!request.passengers || request.passengers.length === 0) {
      return 'Nenhum passageiro';
    }
    const firstPassengerName = request.passengers[0].name;
    if (request.passengers.length > 1) {
      return `${firstPassengerName} +${request.passengers.length - 1}`;
    }
    return firstPassengerName;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <Button onClick={openFormForNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-6">
          Solicitações de Viagem
        </h1>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Passageiro</TableHead>
                <TableHead className="hidden md:table-cell">Itinerário Principal</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground"/>
                            <span>{getPassengerInfo(request)}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                         <div className="flex items-center gap-1">
                             <Plane className="h-4 w-4 text-muted-foreground"/>
                            <span>{getMainItinerary(request)}</span>
                         </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground"/>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(request)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Ver e Exportar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openFormForEdit(request)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(request)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDelete(request.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma solicitação de viagem encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {selectedRequest ? "Editar Solicitação de Viagem" : "Criar Nova Solicitação de Viagem"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <RequestForm
              key={selectedRequest?.id || 'new'}
              onSubmit={handleFormSubmit}
              initialData={selectedRequest}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Visualizar Solicitação</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto p-1">
            <DocumentPreview ref={previewRef} request={selectedRequest} />
          </div>
          <div className="flex-shrink-0 pt-4 flex items-center justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => selectedRequest && exportToPNG(previewRef.current, selectedRequest.title)}>
                  <Download className="mr-2 h-4 w-4" /> PNG
              </Button>
              <Button variant="outline" onClick={() => selectedRequest && exportToPDF(previewRef.current, selectedRequest.title)}>
                  <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button variant="outline" onClick={() => selectedRequest && exportToExcel(selectedRequest)}>
                  <Download className="mr-2 h-4 w-4" /> Excel
              </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a solicitação de viagem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
