// src/services/feedbackService.js
import { db } from "../firebaseConfig.js";
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

/**
 * Salva a justificativa de feedback do usuário no Firestore.
 * @param {string} justification - A justificativa textual ou as dicas concatenadas fornecidas pelo usuário.
 * @returns {Promise<void>}
 */
export const saveFeedback = async (justification) => {
  if (!justification || !justification.trim()) {
      console.warn("Tentativa de salvar feedback vazio.");
      return;
  }
  try {
    // A coleção armazena a justificativa e um timestamp.
    await addDoc(collection(db, "feedback"), {
      justification: justification,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not save feedback to the database.");
  }
};

/**
 * Busca os feedbacks mais recentes do Firestore.
 * @param {number} count - O número de feedbacks a serem recuperados.
 * @returns {Promise<Array<object>>} - Uma lista de objetos de feedback.
 */
export const getRecentFeedback = async (count = 10) => {
  try {
    const feedbackCol = collection(db, "feedback");
    const q = query(feedbackCol, orderBy("createdAt", "desc"), limit(count));
    const querySnapshot = await getDocs(q);
    const feedbackList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return feedbackList;
  } catch (e) {
    console.error("Error fetching feedback: ", e);
    // Em caso de erro (ex: config do firebase errada), retorna um array vazio para não quebrar a extração
    return [];
  }
};