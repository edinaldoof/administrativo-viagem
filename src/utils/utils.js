// src/utils/utils.js

// --- Funções de Formatação ---

export const formatCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o sexto e o sétimo dígitos
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o nono e o décimo dígitos
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede adicionar mais de 2 dígitos após o hífen
};

export const formatDate = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca uma barra entre o segundo e o terceiro dígitos
    .replace(/(\d{2})(\d{1,4})/, '$1/$2') // Coloca uma barra entre o quarto e o quinto dígitos
    .replace(/(\/\d{4})\d+?$/, '$1'); // Impede adicionar mais de 4 dígitos no ano
};

export const formatPhone = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '($1) $2 $3-$4');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return value; // Retorna o valor original se não corresponder aos padrões
};


export const formatCurrency = (value) => {
  if (isNaN(parseFloat(value))) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Verifica se a data é válida

  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// --- Funções de Validação ---

export const validarCPF = (cpf) => {
  if (!cpf) return false;
  const cpfLimpio = cpf.replace(/\D/g, '');

  if (cpfLimpio.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpio)) return false; // Verifica se todos os dígitos são iguais

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpio.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpio.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpio.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpio.substring(10, 11))) return false;

  return true;
};

export const validarDataNascimento = (data) => {
  if (!data) return false;

  const partesData = data.split('/');
  if (partesData.length !== 3) return false;

  const dia = parseInt(partesData[0], 10);
  const mes = parseInt(partesData[1], 10) - 1; // Mês é 0-indexado no JS Date
  const ano = parseInt(partesData[2], 10);

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
  if (partesData[2].length < 4) return false; // Ano deve ter 4 dígitos

  try {
    const dataNasc = new Date(ano, mes, dia);
    // Verifica se a data construída é a mesma (evita datas como 31/02/2000)
    if (dataNasc.getFullYear() !== ano || dataNasc.getMonth() !== mes || dataNasc.getDate() !== dia) {
        return false;
    }

    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNasc.getFullYear();
    const m = hoje.getMonth() - dataNasc.getMonth();

    let idadeFinal = idade;
    if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
      idadeFinal--;
    }
    
    // Não pode ser no futuro e deve ter entre 16 e 120 anos
    return dataNasc <= hoje && idadeFinal >= 16 && idadeFinal <= 120;

  } catch (e) {
    return false;
  }
};

export const validarDataViagem = (data) => {
    if (!data) return false; // Data é obrigatória
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera horas para comparar apenas a data

    // Se a data de entrada for string no formato 'AAAA-MM-DD' (comum em input type="date")
    // precisamos ajustar para o fuso horário local para evitar problemas de "um dia antes"
    const dataViagemParts = data.split('-');
    if (dataViagemParts.length === 3) {
        const ano = parseInt(dataViagemParts[0]);
        const mes = parseInt(dataViagemParts[1]) -1; // Mês é 0-indexado
        const dia = parseInt(dataViagemParts[2]);
        const dataViagem = new Date(ano, mes, dia);
        return dataViagem >= hoje;
    }
    // Se for um objeto Date
    if (data instanceof Date) {
        return data >= hoje;
    }
    // Fallback para outros formatos (pode precisar de ajuste)
    const dataViagemObj = new Date(data);
    return dataViagemObj >= hoje;
};


// --- Outros Utilitários ---

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
