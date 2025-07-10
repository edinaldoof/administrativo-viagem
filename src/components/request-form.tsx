
"use client";

import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { travelRequestSchema, type TravelRequestFormValues } from "@/lib/schemas";
import { type TravelRequest } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileManager } from "@/components/file-manager";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, PlusCircle, Trash2, Users, Plane, Building, ArrowRightLeft } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

interface RequestFormProps {
  onSubmit: (data: TravelRequest) => void;
  initialData?: TravelRequest | null;
}

const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .substring(0, 14);
};


export function RequestForm({ onSubmit, initialData }: RequestFormProps) {
    const form = useForm<TravelRequestFormValues>({
        resolver: zodResolver(travelRequestSchema),
        defaultValues: initialData 
        ? {
            ...initialData,
            passengers: initialData.passengers.map(p => ({
                ...p,
                itinerary: (p.itinerary || []).map(i => ({
                    ...i,
                    departureDate: new Date(i.departureDate),
                    returnDate: i.returnDate ? new Date(i.returnDate) : undefined,
                }))
            }))
        }
        : {
            title: "",
            billing: { costCenter: "" },
            passengers: [{ 
                id: uuidv4(), 
                name: "", 
                cpf: "", 
                documents: [], 
                itinerary: [{ id: uuidv4(), origin: "", destination: "", departureDate: new Date(), isRoundTrip: false }] 
            }],
        },
    });

  const { fields: passengerFields, append: appendPassenger, remove: removePassenger } = useFieldArray({
    control: form.control,
    name: "passengers",
  });

  const handleFormSubmit = (data: TravelRequestFormValues) => {
    const fullData: TravelRequest = {
      id: initialData?.id || uuidv4(),
      createdAt: initialData?.createdAt || new Date(),
      status: initialData?.status || "Draft",
      ...data,
    };
    onSubmit(fullData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Solicitação</FormLabel>
              <FormControl><Input placeholder="ex: Reunião de Equipe T3" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Building /> Faturamento</h3>
             <FormField
                control={form.control}
                name="billing.costCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro de Custo</FormLabel>
                    <FormControl><Input placeholder="ex: ENG-PROJETO-X" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Users /> Passageiros</h3>
             <Accordion type="multiple" defaultValue={passengerFields.map((_, index) => `passenger-${index}`)} className="w-full">
                {passengerFields.map((field, index) => (
                  <AccordionItem value={`passenger-${index}`} key={field.id} className="border rounded-md px-4">
                     <AccordionTrigger className="hover:no-underline">
                        Passageiro {index + 1}: {form.watch(`passengers.${index}.name`) || "Novo Passageiro"}
                     </AccordionTrigger>
                     <AccordionContent className="space-y-4 pt-2">
                        <FormField
                            control={form.control}
                            name={`passengers.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl><Input placeholder="João da Silva" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`passengers.${index}.cpf`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CPF</FormLabel>
                                    <FormControl><Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(formatCpf(e.target.value))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Controller
                            control={form.control}
                            name={`passengers.${index}.documents`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Documentos</FormLabel>
                                    <FormControl>
                                        <FileManager files={field.value || []} onFilesChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <ItinerarySubForm passengerIndex={index} form={form} />

                        {passengerFields.length > 1 && <Button type="button" variant="destructive" size="sm" onClick={() => removePassenger(index)}><Trash2 className="mr-2 h-4 w-4" />Remover Passageiro</Button>}
                     </AccordionContent>
                  </AccordionItem>
                ))}
             </Accordion>
             <Button type="button" variant="outline" onClick={() => appendPassenger({ id: uuidv4(), name: "", cpf: "", documents: [], itinerary: [{id: uuidv4(), origin: "", destination: "", departureDate: new Date(), isRoundTrip: false}] })}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Passageiro</Button>
        </div>

        <Button type="submit" className="w-full">
          {initialData ? "Salvar Alterações" : "Criar Solicitação"}
        </Button>
      </form>
    </Form>
  );
}

// Sub-component for itinerary to keep the main form cleaner
function ItinerarySubForm({ passengerIndex, form }: { passengerIndex: number, form: any }) {
    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: `passengers.${passengerIndex}.itinerary`
    });

    const handleRoundTrip = (itineraryIndex: number) => {
        const currentItinerary = form.getValues(`passengers.${passengerIndex}.itinerary.${itineraryIndex}`);
        update(itineraryIndex, { ...currentItinerary, isRoundTrip: !currentItinerary.isRoundTrip });
    };

    const createReturnLeg = (itineraryIndex: number) => {
        const originLeg = form.getValues(`passengers.${passengerIndex}.itinerary.${itineraryIndex}`);
        append({
            id: uuidv4(),
            origin: originLeg.destination,
            destination: originLeg.origin,
            departureDate: originLeg.returnDate || new Date(),
            isRoundTrip: false,
        });
    };
    
    return (
        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Plane /> Itinerário do Passageiro</h3>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-slate-50">
                        <h4 className="font-medium">Trecho {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`passengers.${passengerIndex}.itinerary.${index}.origin`} render={({ field }) => (
                                <FormItem><FormLabel>Origem</FormLabel><FormControl><Input placeholder="Cidade ou Aeroporto" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`passengers.${passengerIndex}.itinerary.${index}.destination`} render={({ field }) => (
                                <FormItem><FormLabel>Destino</FormLabel><FormControl><Input placeholder="Cidade ou Aeroporto" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`passengers.${passengerIndex}.itinerary.${index}.departureDate`} render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Data de Partida</FormLabel>
                                    <Popover><PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal bg-white", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar locale={ptBR} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} />
                                    </PopoverContent></Popover>
                                <FormMessage /></FormItem>
                            )} />
                            {form.watch(`passengers.${passengerIndex}.itinerary.${index}.isRoundTrip`) && (
                                <FormField control={form.control} name={`passengers.${passengerIndex}.itinerary.${index}.returnDate`} render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>Data de Retorno</FormLabel>
                                        <Popover><PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal bg-white", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar locale={ptBR} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < form.getValues(`passengers.${passengerIndex}.itinerary.${index}.departureDate`)} />
                                        </PopoverContent></Popover>
                                    <FormMessage /></FormItem>
                                )} />
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id={`round-trip-${passengerIndex}-${index}`} checked={form.watch(`passengers.${passengerIndex}.itinerary.${index}.isRoundTrip`)} onCheckedChange={() => handleRoundTrip(index)} />
                            <label htmlFor={`round-trip-${passengerIndex}-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Viagem de ida e volta</label>
                        </div>
                        {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), origin: "", destination: "", departureDate: new Date(), isRoundTrip: false })}>
                    <PlusCircle className="mr-2 h-4 w-4" />Adicionar Trecho
                </Button>
                { form.watch(`passengers.${passengerIndex}.itinerary.${fields.length - 1}.isRoundTrip`) &&
                  form.watch(`passengers.${passengerIndex}.itinerary.${fields.length - 1}.returnDate`) &&
                  (
                    <Button type="button" variant="outline" onClick={() => createReturnLeg(fields.length - 1)}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />Trecho de Volta Automático
                    </Button>
                  )
                }
            </div>
        </div>
    );
}
