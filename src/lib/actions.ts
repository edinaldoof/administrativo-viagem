
"use client"

import { type TravelRequest, type PassengerProfile } from "@/types";

const REQUESTS_STORAGE_KEY = "viagens-fadex-requests";
const PASSENGERS_STORAGE_KEY = "viagens-fadex-passengers";

// --- Travel Requests ---

export const getRequests = (): TravelRequest[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const storedRequests = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
    return storedRequests ? JSON.parse(storedRequests) : [];
  } catch (error) {
    console.error("Failed to parse requests from localStorage", error);
    return [];
  }
};

export const saveRequests = (requests: TravelRequest[]): void => {
   if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
     console.error("Failed to save requests to localStorage", error);
  }
};


// --- Passengers ---

export const getPassengers = (): PassengerProfile[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(PASSENGERS_STORAGE_KEY);
    if (stored) {
      // Garantir que as datas sejam objetos Date
      return JSON.parse(stored).map((p: any) => ({...p, birthDate: new Date(p.birthDate)}));
    }
    return [];
  } catch (error) {
    console.error("Failed to parse passengers from localStorage", error);
    return [];
  }
};

export const savePassengers = (passengers: PassengerProfile[]): void => {
   if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PASSENGERS_STORAGE_KEY, JSON.stringify(passengers));
  } catch (error) {
     console.error("Failed to save passengers to localStorage", error);
  }
};
