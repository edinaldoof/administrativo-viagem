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
  ciaAerea: z.string().optional(),
  voo: z.string().optional(),
  horarios: z.string().optional(),
}).refine(data => {
    if (data.isRoundTrip && data.returnDate) {
        return data.returnDate > data.departureDate;
    }
    return true;
}, {
    message: "A data de retorno deve ser posterior à data de partida.",
    path: ["returnDate"],
});

const validateCpf = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const digits = cpf.split('').map(Number);
  
  const validator = (n: number) => {
    const rest = digits.slice(0, n).reduce((sum, digit, index) => sum + digit * (n + 1 - index), 0) % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  
  return validator(9) === digits[9] && validator(10) === digits[10];
};

export const passengerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  cpf: z.string().refine(validateCpf, { message: "CPF inválido." }),
  birthDate: z.date({ required_error: "A data de nascimento é obrigatória." }),
  documents: z.array(fileSchema).optional().default([]),
  itinerary: z.array(itinerarySchema).min(1, "É necessário pelo menos um trecho no itinerário."),
});

export const travelRequestSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  passengers: z.array(passengerSchema).min(1, "É necessário pelo menos um passageiro."),
  billing: z.object({
    costCenter: z.string().min(1, "O centro de custo é obrigatório."),
    account: z.string().optional(),
    description: z.string().optional(),
    webId: z.string().optional(),
  })
});

export type TravelRequestFormValues = z.infer<typeof travelRequestSchema>;
