// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Cole aqui a configuração do seu projeto Firebase.
// Você pode encontrar esses dados no Console do Firebase, nas configurações do seu projeto,
// ao adicionar um aplicativo Web.
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_ID_DE_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase com a configuração fornecida.
const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore e obtém uma referência ao serviço.
const db = getFirestore(app);

export { db };
