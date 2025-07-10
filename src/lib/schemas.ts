import { z } from 'zod';

// Esquema para um único itinerário
const ItinerarySchema = z.object({
  origin: z.string().describe("Cidade de origem da viagem."),
  destination: z.string().describe("Cidade de destino da viagem."),
  departureDate: z.coerce.date().describe("Data de partida no formato YYYY-MM-DD."),
  returnDate: z.coerce.date().optional().describe("Data de retorno no formato YYYY-MM-DD, se for ida e volta."),
  isRoundTrip: z.boolean().describe("Verdadeiro se for uma viagem de ida e volta."),
  ciaAerea: z.string().optional().describe("Companhia aérea sugerida."),
  voo: z.string().optional().describe("Número do voo sugerido."),
  horarios: z.string().optional().describe("Horários de voo sugeridos."),
});

// Esquema para um único passageiro
const PassengerSchema = z.object({
  name: z.string().describe("Nome completo do passageiro."),
  cpf: z.string().describe("CPF do passageiro."),
  birthDate: z.coerce.date().describe("Data de nascimento do passageiro."),
  email: z.string().email().optional().describe("E-mail do passageiro."),
  phone: z.string().optional().describe("Telefone de contato do passageiro."),
  itinerary: z.array(ItinerarySchema).describe("Lista de itinerários para o passageiro."),
});

// Esquema para os dados de faturamento
const BillingSchema = z.object({
  costCenter: z.string().optional().describe("Centro de custo para faturamento."),
  account: z.string().optional().describe("Número do projeto para faturamento."),
  webId: z.string().optional().describe("ID da web ou número da solicitação."),
  description: z.string().optional().describe("Justificativa ou finalidade da viagem."),
});

// Esquema principal para a solicitação de viagem
export const travelRequestSchema = z.object({
  title: z.string().optional().describe("Título do documento de solicitação."),
  billing: BillingSchema.describe("Informações de faturamento."),
  passengers: z.array(PassengerSchema).describe("Lista de passageiros."),
});
