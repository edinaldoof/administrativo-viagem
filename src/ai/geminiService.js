// src/ai/geminiService.js

export async function extractDataFromPdfWithGemini(pdfDataUri) {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  
  // ADICIONE ESTA LINHA PARA DEPURAR
  console.log("CHAVE DE API CARREGADA:", apiKey); 

  if (!apiKey) {
    throw new Error("A chave de API do Google não foi encontrada. Verifique o arquivo .env.");
  }

  const base64Data = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    Analise o seguinte documento PDF (Requisição para Compra de Passagens) e extraia as informações em formato JSON. 
    Preste muita atenção aos nomes e à estrutura dos campos. Retorne apenas o JSON.

    A estrutura deve ser:
    {
      "billing": {
        "costCenter": "valor do CENTRO DE CUSTO",
        "account": "valor do NUMERO DO PROJETO",
        "webId": "número do campo 'Numero da Solicitacao: WEB:'",
        "description": "conteúdo do campo 'JUSTIFICATIVA/FINALIDADE'"
      },
      "passengers": [
        {
          "name": "Nome completo do passageiro",
          "cpf": "CPF do passageiro",
          "birthDate": "Data de nascimento no formato DD/MM/YYYY",
          "email": "E-mail do passageiro",
          "phone": "Telefone ou celular do passageiro",
          "itinerary": [
            {
              "origin": "CIDADE DE ORIGEM",
              "destination": "CIDADE DE DESTINO",
              "departureDate": "DATA DE SAIDA no formato DD/MM/YYYY"
            }
          ]
        }
      ]
    }
  `;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "application/pdf", data: base64Data } }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Erro na API do Google: ${errorBody.error?.message || response.statusText}`);
    }

    const responseData = await response.json();
    const jsonText = responseData.candidates[0].content.parts[0].text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Falha ao comunicar com a API do Gemini:", error);
    throw error;
  }
}