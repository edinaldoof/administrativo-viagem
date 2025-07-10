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
};

export type Passenger = {
  id: string;
  name: string;
  cpf: string;
  documents: DocumentFile[];
  itinerary: Itinerário[]; // MUDANÇA: Itinerário agora é por passageiro
};

export type Itinerário = {
  id: string;
  origin: string;
  destination: string;
  departureDate: Date;
  isRoundTrip: boolean;
  returnDate?: Date;
};

export type Billing = {
  costCenter: string;
};

export type TravelRequest = {
  id: string;
  title: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  createdAt: Date;
  passengers: Passenger[];
  billing: Billing;
};