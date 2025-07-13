// Gera um ID único simples
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // Formata um CPF no formato 000.000.000-00
  export const formatCPF = (cpf) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cpf;
  };
  
  // Valida um CPF
  export const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
  };
  
  // Valida a data de nascimento (entre 16 e 120 anos)
  export const validarDataNascimento = (dataNasc) => {
    const partes = dataNasc.split('/');
    if (partes.length !== 3) return false;
    const data = new Date(partes[2], partes[1] - 1, partes[0]);
    if (isNaN(data.getTime())) return false;
    const hoje = new Date();
    const idade = hoje.getFullYear() - data.getFullYear();
    const m = hoje.getMonth() - data.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) {
      // ainda não fez aniversário este ano
    }
    return idade >= 16 && idade <= 120;
  };

  // Valida se a data da viagem não é no passado
  export const validarDataViagem = (dataViagem) => {
    const data = new Date(dataViagem);
    // Adiciona o fuso horário para evitar problemas de "um dia antes"
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
    return data >= hoje;
  };

  export const formatDate = (dateString) => {
    const cleaned = dateString.replace(/\D/g, '');
    let match = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
    if(match) {
        return `${match[1]}/${match[2]}/${match[4]}`
    }
    match = cleaned.match(/^(\d{2})(\d{2})$/);
    if(match) {
        return `${match[1]}/${match[2]}`
    }
    match = cleaned.match(/^(\d{2})$/);
    if(match) {
        return `${match[1]}`
    }
    return dateString;
  }

  export const formatDateToYYYYMMDD = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  export const formatDateToDDMMYYYY = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };
