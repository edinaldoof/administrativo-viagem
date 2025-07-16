// src/services/passengerService.js
import { db } from "@/firebaseConfig.js";
import { collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";

/**
 * Verifica se um passageiro existe pelo CPF. Se não, cria um novo.
 * Retorna os dados do passageiro do banco de dados (existente ou novo).
 * @param {object} passengerData - Dados do passageiro do formulário.
 * @returns {Promise<object>} - Os dados do passageiro salvos.
 */
export const getOrSavePassenger = async (passengerData) => {
  if (!passengerData.cpf) {
    throw new Error('CPF é obrigatório para salvar um passageiro.');
  }
  
  const passengersRef = collection(db, "passengers");
  // O ID do documento será o CPF normalizado para garantir unicidade
  const docId = passengerData.cpf.replace(/\D/g, '');
  const passengerDocRef = doc(passengersRef, docId);

  const docSnap = await getDoc(passengerDocRef);

  if (docSnap.exists()) {
    // Passageiro já existe, retorna os dados do banco
    console.log("Passageiro encontrado:", docSnap.data());
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    // Passageiro não existe, cria um novo registro
    const newPassengerData = {
      nome: passengerData.nome,
      cpf: passengerData.cpf,
      dataNascimento: passengerData.dataNascimento,
      email: passengerData.email || '',
      phone: passengerData.phone || '',
      createdAt: new Date(),
    };
    
    await setDoc(passengerDocRef, newPassengerData);
    console.log("Novo passageiro criado com ID:", docId);
    return { id: docId, ...newPassengerData };
  }
};

/**
 * Busca todos os passageiros cadastrados.
 * @returns {Promise<Array<object>>} - Uma lista de objetos de passageiros.
 */
export const getAllPassengers = async () => {
  try {
    const passengersCol = collection(db, "passengers");
    const querySnapshot = await getDocs(passengersCol);
    const passengerList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return passengerList;
  } catch (e) {
    console.error("Error fetching passengers: ", e);
    throw new Error("Could not fetch passengers from the database.");
  }
};
