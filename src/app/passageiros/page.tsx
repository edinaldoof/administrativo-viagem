
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Edit, Trash2, User, MoreVertical, Plane, Calendar as CalendarIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { getPassengers, savePassengers, getRequests } from '@/lib/actions';
import { type PassengerProfile, type TravelRequest } from '@/types';
import { passengerProfileSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .substring(0, 14);
};

export default function PassageirosPage() {
  const [passengers, setPassengers] = useState<PassengerProfile[]>([]);
  const [allRequests, setAllRequests] = useState<TravelRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerProfile | null>(null);
  const [passengerForDetails, setPassengerForDetails] = useState<PassengerProfile | null>(null);
  const [passengerToDelete, setPassengerToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PassengerProfile>({
    resolver: zodResolver(passengerProfileSchema),
  });

  useEffect(() => {
    setPassengers(getPassengers());
    setAllRequests(getRequests());
  }, []);

  const handleSavePassengers = (updatedPassengers: PassengerProfile[]) => {
    savePassengers(updatedPassengers);
    setPassengers(updatedPassengers);
  };

  const openFormForNew = () => {
    form.reset({ id: uuidv4(), name: '', cpf: '', birthDate: new Date(), email: '', phone: '' });
    setSelectedPassenger(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (passenger: PassengerProfile) => {
    form.reset({
        ...passenger,
        birthDate: new Date(passenger.birthDate)
    });
    setSelectedPassenger(passenger);
    setIsFormOpen(true);
  };

  const openDetails = (passenger: PassengerProfile) => {
    setPassengerForDetails(passenger);
    setIsDetailsOpen(true);
  };

  const confirmDelete = (id: string) => {
    setPassengerToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (!passengerToDelete) return;
    const updatedPassengers = passengers.filter((p) => p.id !== passengerToDelete);
    handleSavePassengers(updatedPassengers);
    toast({ title: 'Sucesso', description: 'Passageiro excluído com sucesso.' });
    setIsAlertOpen(false);
    setPassengerToDelete(null);
  };

  const handleFormSubmit = (data: PassengerProfile) => {
    const updatedList = selectedPassenger
      ? passengers.map((p) => (p.id === selectedPassenger.id ? data : p))
      : [...passengers, data];
    
    handleSavePassengers(updatedList);
    toast({ title: 'Sucesso', description: `Passageiro ${selectedPassenger ? 'atualizado' : 'criado'} com sucesso.` });
    setIsFormOpen(false);
    setSelectedPassenger(null);
  };
  
  const getRequestsForPassenger = (cpf: string) => {
    return allRequests
      .filter(req => req.passengers.some(p => p.cpf === cpf))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getMainItinerarySummary = (request: TravelRequest) => {
    const passengerInRequest = request.passengers.find(p => p.cpf === passengerForDetails?.cpf);
    const itinerary = passengerInRequest?.itinerary;
    if (!itinerary || itinerary.length === 0) return 'Sem itinerário';
    const firstLeg = itinerary[0];
    return `${firstLeg.origin} → ${firstLeg.destination}`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Gerenciar Passageiros</h2>
          <p className="text-muted-foreground">
            Adicione, edite e gerencie os passageiros que podem ser incluídos nas solicitações de viagem.
          </p>
        </div>
        <Button onClick={openFormForNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Passageiro
        </Button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengers.length > 0 ? (
              passengers.map((passenger) => (
                <TableRow key={passenger.id} className="cursor-pointer" onClick={() => openDetails(passenger)}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground"/> {passenger.name}
                  </TableCell>
                  <TableCell>{passenger.cpf}</TableCell>
                  <TableCell>{new Date(passenger.birthDate).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openFormForEdit(passenger)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDelete(passenger.id)}
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
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum passageiro cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedPassenger ? 'Editar Passageiro' : 'Novo Passageiro'}</DialogTitle>
             <DialogDescription>
              {selectedPassenger ? "Atualize os dados do passageiro." : "Adicione um novo passageiro à sua lista."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(formatCpf(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar locale={ptBR} mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1920} toYear={new Date().getFullYear()} />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="joao.silva@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-xl">
              {passengerForDetails && (
                  <>
                      <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Histórico de Viagens</DialogTitle>
                          <DialogDescription>
                              Exibindo todas as solicitações para {passengerForDetails.name}.
                          </DialogDescription>
                      </DialogHeader>
                      <Separator />
                      <div className="max-h-[60vh] overflow-y-auto p-1 -mx-4 px-4 space-y-4">
                          {getRequestsForPassenger(passengerForDetails.cpf).length > 0 ? (
                              getRequestsForPassenger(passengerForDetails.cpf).map(request => (
                                  <Link key={request.id} href="/solicitacoes" passHref>
                                      <div className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <p className="font-semibold">{request.title}</p>
                                                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                      <Plane size={14} /> {getMainItinerarySummary(request)}
                                                  </p>
                                              </div>
                                              <Badge variant="outline">{request.status}</Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
                                              <CalendarIconLucide size={12} /> Criado em: {new Date(request.createdAt).toLocaleDateString()}
                                          </p>
                                      </div>
                                  </Link>
                              ))
                          ) : (
                              <div className="text-center py-10">
                                  <p className="text-muted-foreground">Nenhuma solicitação de viagem encontrada para este passageiro.</p>
                              </div>
                          )}
                      </div>
                  </>
              )}
          </DialogContent>
      </Dialog>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o passageiro.
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
