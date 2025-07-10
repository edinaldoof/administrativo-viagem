export type DocumentFile = {
  name: string;
  size: number;
  type: string;
  url: string; // Blob URL for client-side preview
  fileObject?: File; // The actual file object for uploads
};

export type ItinerarySegment = {
  id:string;
  origin: string;
  destination: string;
  departureDate: Date;
  isRoundTrip: boolean;
  returnDate?: Date;
  ciaAerea?: string;
  voo?: string;
  horarios?: string;
};

export type Passenger = {
  id: string;
  name: string;
  cpf: string;
  birthDate: Date;
  documents: DocumentFile[];
  itinerary: ItinerarySegment[];
};

export type Billing = {
  costCenter: string;
  account?: string;
  description?: string;
  webId?: string;
};

export type TravelRequest = {
  id: string;
  title: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  createdAt: Date;
  passengers: Passenger[];
  billing: Billing;
};

// Novo tipo para a base de dados de passageiros
export type PassengerProfile = {
  id: string;
  name: string;
  cpf: string;
  birthDate: Date;
};
