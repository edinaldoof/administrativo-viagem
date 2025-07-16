// src/services/requestService.js
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, documentId } from "firebase/firestore";

/**
 * Salva uma nova requisição no Firestore.
 * @param {object} requestData - Os dados completos da requisição.
 * @returns {Promise<string>} - O ID da requisição salva.
 */
export const saveRequest = async (requestData) => {
  try {
    const enrichedData = {
      ...requestData,
      savedAt: serverTimestamp() // Adiciona um timestamp do servidor
    };
    const docRef = await addDoc(collection(db, "requests"), enrichedData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding request document: ", e);
    throw new Error("Could not save request to the database.");
  }
};

/**
 * Busca todas as requisições salvas, ordenadas pela mais recente.
 * @returns {Promise<Array<object>>} - Uma lista de objetos de requisição.
 */
export const getAllRequests = async () => {
  try {
    const requestsCol = collection(db, "requests");
    const q = query(requestsCol, orderBy("savedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const requestList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return requestList;
  } catch (e) {
    console.error("Error fetching requests: ", e);
    throw new Error("Could not fetch requests from the database.");
  }
};

/**
 * Busca requisições pelo campo webId.
 * @param {string} webId - O WEB ID a ser pesquisado.
 * @returns {Promise<Array<object>>} - Uma lista de requisições que correspondem ao webId.
 */
export const getRequestsByWebId = async (webId) => {
  if (!webId) {
    return getAllRequests(); // Se a busca for vazia, retorna todas
  }
  try {
    const requestsCol = collection(db, "requests");
    const q = query(requestsCol, where("webId", "==", webId), orderBy("savedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const requestList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return requestList;
  } catch (e) {
    console.error("Error searching requests by webId: ", e);
    throw new Error("Could not search requests.");
  }
};

/**
 * Busca requisições por uma lista de IDs de passageiros.
 * @param {Array<string>} passengerIds - Array de IDs de passageiros (CPFs).
 * @returns {Promise<Array<object>>} - Uma lista de requisições que correspondem aos IDs.
 */
export const getRequestsByPassengerIds = async (passengerIds) => {
  if (!passengerIds || passengerIds.length === 0) {
    return [];
  }
  try {
    const requestsCol = collection(db, "requests");
    // Firestore 'array-contains-any' é ideal para isso.
    const q = query(requestsCol, where("passengerIds", "array-contains-any", passengerIds));
    const querySnapshot = await getDocs(q);
    const requestList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return requestList;
  } catch (e) {
    console.error("Error searching requests by passenger IDs: ", e);
    throw new Error("Could not search requests by passenger IDs.");
  }
};
