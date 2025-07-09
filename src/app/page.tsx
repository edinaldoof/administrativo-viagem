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
    toast({ title: "Success", description: "Request deleted successfully." });
    setIsAlertOpen(false);
    setRequestToDelete(null);
  };

  const handleDuplicate = (request: TravelRequest) => {
    const newRequest: TravelRequest = {
      ...JSON.parse(JSON.stringify(request)), // Deep copy
      id: crypto.randomUUID(),
      title: `${request.title} (Copy)`,
      createdAt: new Date(),
    };
    handleSaveRequests([...requests, newRequest]);
    toast({ title: "Success", description: "Request duplicated successfully." });
  };
  
  const handleFormSubmit = (data: TravelRequest) => {
    const updatedRequests = selectedRequest
      ? requests.map((r) => (r.id === selectedRequest.id ? data : r))
      : [...requests, data];
    handleSaveRequests(updatedRequests);
    toast({ title: "Success", description: `Request ${selectedRequest ? 'updated' : 'created'} successfully.` });
    setIsFormOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <Button onClick={openFormForNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-6">
          Travel Requests
        </h1>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Passengers</TableHead>
                <TableHead className="hidden md:table-cell">Itinerary</TableHead>
                <TableHead className="hidden lg:table-cell">Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
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
                            <Users className="h-4 w-4 text-muted-foreground"/>
                            <span>{request.passengers.length}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                         <div className="flex items-center gap-1">
                             <Plane className="h-4 w-4 text-muted-foreground"/>
                            <span>{request.itinerary.map(i => i.origin).join(', ')}</span>
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
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(request)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View & Export</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openFormForEdit(request)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(request)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDelete(request.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No travel requests found.
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
              {selectedRequest ? "Edit Travel Request" : "Create New Travel Request"}
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
            <DialogTitle className="font-headline text-2xl">Request Preview</DialogTitle>
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the travel request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
