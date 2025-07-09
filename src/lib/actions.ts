"use client"

import { type TravelRequest } from "@/types";

const STORAGE_KEY = "viagens-fadex-requests";

export const getRequests = (): TravelRequest[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const storedRequests = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
     console.error("Failed to save requests to localStorage", error);
  }
};
