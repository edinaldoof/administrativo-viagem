import { z } from "zod";

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
  fileObject: z.any().optional(),
});

export const itinerarySchema = z.object({
  id: z.string(),
  origin: z.string().min(2, "A origem é obrigatória."),
  destination: z.string().min(2, "O destino é obrigatório."),
  departureDate: z.date({ required_error: "A data de partida é obrigatória." }),
  isRoundTrip: z.boolean().default(false),
  returnDate: z.date().optional(),
}).refine(data => {
    if (data.isRoundTrip && data.returnDate) {
        return data.returnDate > data.departureDate;
    }
    return true;
}, {
    message: "A data de retorno deve ser posterior à data de partida.",
    path: ["returnDate"],
});


export const passengerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  cpf: z.string().length(14, "O CPF deve ter 11 dígitos."),
  documents: z.array(fileSchema).optional().default([]),
  itinerary: z.array(itinerarySchema).min(1, "É necessário pelo menos um trecho no itinerário."),
});

export const travelRequestSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  passengers: z.array(passengerSchema).min(1, "É necessário pelo menos um passageiro."),
  billing: z.object({
    costCenter: z.string().min(1, "O centro de custo é obrigatório."),
  })
});

export type TravelRequestFormValues = z.infer<typeof travelRequestSchema>;