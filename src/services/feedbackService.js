// src/services/feedbackService.js
import { db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

/**
 * Faz upload de uma imagem para o Firebase Storage e retorna a URL.
 * @param {File} imageFile - O arquivo de imagem a ser enviado.
 * @returns {Promise<string>} - A URL de download da imagem.
 */
const uploadImageAndGetURL = async (imageFile) => {
  if (!imageFile) return null;
  const filePath = `feedback-images/${Date.now()}-${imageFile.name}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, imageFile);
  return getDownloadURL(storageRef);
};

/**
 * Salva o feedback do usuário no Firestore, incluindo o upload de imagens se houver.
 * @param {object} feedbackData - O objeto de feedback, contendo `structured` e `general`.
 * @returns {Promise<void>}
 */
export const saveFeedback = async (feedbackData) => {
  try {
    const processedStructuredFeedback = {};

    // Faz upload das imagens do feedback estruturado
    if (feedbackData.structured) {
      for (const [key, value] of Object.entries(feedbackData.structured)) {
        let imageUrl = null;
        if (value.image instanceof File) {
          imageUrl = await uploadImageAndGetURL(value.image);
        }
        processedStructuredFeedback[key] = {
          value: value.value || '',
          imageUrl: imageUrl
        };
      }
    }

    await addDoc(collection(db, "feedback"), {
      general: feedbackData.general || '',
      structured: processedStructuredFeedback,
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
