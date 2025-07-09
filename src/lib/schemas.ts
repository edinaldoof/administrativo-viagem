import { z } from "zod";

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
});

export const passengerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  cpf: z.string().length(14, "CPF must be 11 digits."),
  documents: z.array(fileSchema).optional().default([]),
});

export const itinerarySchema = z.object({
  id: z.string(),
  origin: z.string().min(2, "Origin is required."),
  destination: z.string().min(2, "Destination is required."),
  departureDate: z.date({ required_error: "Departure date is required." }),
  isRoundTrip: z.boolean().default(false),
  returnDate: z.date().optional(),
}).refine(data => {
    if (data.isRoundTrip && data.returnDate) {
        return data.returnDate > data.departureDate;
    }
    return true;
}, {
    message: "Return date must be after departure date.",
    path: ["returnDate"],
});

export const travelRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  passengers: z.array(passengerSchema).min(1, "At least one passenger is required."),
  itinerary: z.array(itinerarySchema).min(1, "At least one itinerary segment is required."),
  billing: z.object({
    costCenter: z.string().min(1, "Cost center is required."),
  })
});

export type TravelRequestFormValues = z.infer<typeof travelRequestSchema>;
