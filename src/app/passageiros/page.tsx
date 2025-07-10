
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Edit, Trash2, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DialogTrigger,
  DialogFooter,
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
import { getPassengers, savePassengers } from '@/lib/actions';
import { type PassengerProfile } from '@/types';
import { passengerProfileSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from '@/lib/utils';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerProfile | null>(null);
  const [passengerToDelete, setPassengerToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PassengerProfile>({
    resolver: zodResolver(passengerProfileSchema),
  });

  useEffect(() => {
    setPassengers(getPassengers());
  }, []);

  const handleSavePassengers = (updatedPassengers: PassengerProfile[]) => {
    savePassengers(updatedPassengers);
    setPassengers(updatedPassengers);
  };

  const openFormForNew = () => {
    form.reset({ id: uuidv4(), name: '', cpf: '', birthDate: new Date() });
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
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Passageiros</h2>
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
                <TableRow key={passenger.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground"/> {passenger.name}
                  </TableCell>
                  <TableCell>{passenger.cpf}</TableCell>
                  <TableCell>{new Date(passenger.birthDate).toLocaleDateString()}</TableCell>
                  <TableCell>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedPassenger ? 'Editar Passageiro' : 'Novo Passageiro'}</DialogTitle>
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
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
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
