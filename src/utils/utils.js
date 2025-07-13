// src/utils/utils.js

/**
 * Gera um ID único simples.
 * @returns {string}
 */
export const generateId = () => {
  return `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formata um número de CPF (XXX.XXX.XXX-XX).
 * @param {string} cpf
 * @returns {string}
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  const value = cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
  let formatted = value;
  if (value.length > 3) {
    formatted = value.replace(/(\d{3})(\d)/, '$1.$2');
  }
  if (value.length > 6) {
    formatted = formatted.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  }
  if (value.length > 9) {
    formatted = formatted.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  return formatted.slice(0, 14); // Garante o tamanho máximo
};

/**
 * Formata uma data (DD/MM/AAAA).
 * @param {string} date
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return '';
    const value = date.replace(/\D/g, ''); // Remove tudo que não é dígito
    let formatted = value;
    if (value.length > 2) {
      formatted = value.replace(/(\d{2})(\d)/, '$1/$2');
    }
    if (value.length > 4) {
      formatted = formatted.replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }
    return formatted.slice(0, 10); // Garante o tamanho máximo
};

/**
 * Valida um CPF.
 * @param {string} cpf
 * @returns {boolean}
 */
export const validarCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) return false;
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
  return true;
};

/**
 * Valida a data de nascimento (entre 16 e 120 anos).
 * @param {string} dataNascimento - Formato DD/MM/AAAA
 * @returns {boolean}
 */
export const validarDataNascimento = (dataNascimento) => {
    const partes = dataNascimento.split('/');
    if (partes.length !== 3) return false;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    const data = new Date(ano, mes, dia);
    if (data.getFullYear() !== ano || data.getMonth() !== mes || data.getDate() !== dia) return false;
    const hoje = new Date();
    const idade = hoje.getFullYear() - data.getFullYear();
    const m = hoje.getMonth() - data.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) {
      return idade - 1 >= 16 && idade - 1 <= 120;
    }
    return idade >= 16 && idade <= 120;
};

/**
 * Valida se a data de viagem não é no passado.
 * @param {string} dataViagem - Formato AAAA-MM-DD
 * @returns {boolean}
 */
export const validarDataViagem = (dataViagem) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
    const data = new Date(dataViagem + 'T00:00:00-03:00'); // Considera fuso horário
    return data >= hoje;
};

/**
 * Converte data de AAAA-MM-DD para DD/MM/AAAA.
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Converte data de DD/MM/AAAA para AAAA-MM-DD.
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};
