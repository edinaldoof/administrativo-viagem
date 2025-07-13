// src/services/feedbackService.js
import { db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

/**
 * Salva o feedback do usuário no Firestore.
 * @param {string} feedbackText - O texto do feedback fornecido pelo usuário.
 * @returns {Promise<void>}
 */
export const saveFeedback = async (feedbackText) => {
  try {
    await addDoc(collection(db, "feedback"), {
      text: feedbackText,
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
export const getRecentFeedback = async (count = 5) => {
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