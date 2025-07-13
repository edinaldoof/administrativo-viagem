// Utilitários para formatação de dados

export const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '.')
      .replace(/(\d{3})(\d)/, '.')
      .replace(/(\d{3})(\d{1,2})/, '-')
      .replace(/(-\d{2})\d+?$/, '');
  };
  
  export const formatDate = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '/')
      .replace(/(\d{2})(\d{1,4})/, '/')
      .replace(/(\d{4})\d+?$/, '');
  };
  
  export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  export const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };
  
  export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  