import { ERROR_MESSAGES } from './constants';

// ===============================
// Basic Validators
// ===============================

/**
 * Valida si un campo es requerido
 */
export const required = (value) => {
  if (value === null || value === undefined || value === '') {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  return null;
};

/**
 * Valida longitud mínima
 */
export const minLength = (min) => (value) => {
  if (!value || value.length < min) {
    return `Debe tener al menos ${min} caracteres`;
  }
  return null;
};

/**
 * Valida longitud máxima
 */
export const maxLength = (max) => (value) => {
  if (value && value.length > max) {
    return `No puede exceder ${max} caracteres`;
  }
  return null;
};

/**
 * Valida longitud exacta
 */
export const exactLength = (length) => (value) => {
  if (value && value.length !== length) {
    return `Debe tener exactamente ${length} caracteres`;
  }
  return null;
};

// ===============================
// Email Validators
// ===============================

/**
 * Valida formato de email
 */
export const email = (value) => {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

/**
 * Valida email con dominios específicos
 */
export const emailWithDomains = (allowedDomains) => (value) => {
  const emailError = email(value);
  if (emailError) return emailError;
  
  if (!value) return null;
  
  const domain = value.split('@')[1];
  if (allowedDomains && !allowedDomains.includes(domain)) {
    return `Solo se permiten emails de: ${allowedDomains.join(', ')}`;
  }
  return null;
};

// ===============================
// Password Validators
// ===============================

/**
 * Valida contraseña básica
 */
export const password = (value) => {
  if (!value) return null;
  
  if (value.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
};

/**
 * Valida contraseña fuerte
 */
export const strongPassword = (value) => {
  if (!value) return null;
  
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  
  if (value.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }
  
  if (!hasUpperCase) {
    return 'La contraseña debe incluir al menos una letra mayúscula';
  }
  
  if (!hasLowerCase) {
    return 'La contraseña debe incluir al menos una letra minúscula';
  }
  
  if (!hasNumbers) {
    return 'La contraseña debe incluir al menos un número';
  }
  
  if (!hasSpecialChar) {
    return 'La contraseña debe incluir al menos un carácter especial';
  }
  
  return null;
};

/**
 * Valida confirmación de contraseña
 */
export const confirmPassword = (originalPassword) => (value) => {
  if (!value) return null;
  
  if (value !== originalPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
};

// ===============================
// Number Validators
// ===============================

/**
 * Valida que sea un número
 */
export const number = (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  if (isNaN(value)) {
    return 'Debe ser un número válido';
  }
  return null;
};

/**
 * Valida número entero
 */
export const integer = (value) => {
  const numberError = number(value);
  if (numberError) return numberError;
  
  if (value !== null && value !== undefined && value !== '' && !Number.isInteger(Number(value))) {
    return 'Debe ser un número entero';
  }
  return null;
};

/**
 * Valida valor mínimo
 */
export const min = (minValue) => (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  if (Number(value) < minValue) {
    return `El valor mínimo es ${minValue}`;
  }
  return null;
};

/**
 * Valida valor máximo
 */
export const max = (maxValue) => (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  if (Number(value) > maxValue) {
    return `El valor máximo es ${maxValue}`;
  }
  return null;
};

/**
 * Valida rango de valores
 */
export const range = (minValue, maxValue) => (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  const numValue = Number(value);
  if (numValue < minValue || numValue > maxValue) {
    return `El valor debe estar entre ${minValue} y ${maxValue}`;
  }
  return null;
};

// ===============================
// Phone Validators
// ===============================

/**
 * Valida número de teléfono básico
 */
export const phone = (value) => {
  if (!value) return null;
  
  // Remover espacios, guiones y paréntesis
  const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
  
  // Validar que solo contenga números y opcionalmente un + al inicio
  const phoneRegex = /^\+?[\d]{8,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Número de teléfono inválido';
  }
  return null;
};

/**
 * Valida teléfono internacional
 */
export const internationalPhone = (value) => {
  if (!value) return null;
  
  const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
  const intlPhoneRegex = /^\+[1-9]\d{1,14}$/;
  
  if (!intlPhoneRegex.test(cleanPhone)) {
    return 'Debe incluir código de país (ej: +54...)';
  }
  return null;
};

// ===============================
// Date Validators
// ===============================

/**
 * Valida formato de fecha
 */
export const date = (value) => {
  if (!value) return null;
  
  const dateObj = new Date(value);
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  return null;
};

/**
 * Valida fecha mínima
 */
export const minDate = (minDate) => (value) => {
  if (!value) return null;
  
  const dateObj = new Date(value);
  const minDateObj = new Date(minDate);
  
  if (dateObj < minDateObj) {
    return `La fecha debe ser posterior a ${minDateObj.toLocaleDateString()}`;
  }
  return null;
};

/**
 * Valida fecha máxima
 */
export const maxDate = (maxDate) => (value) => {
  if (!value) return null;
  
  const dateObj = new Date(value);
  const maxDateObj = new Date(maxDate);
  
  if (dateObj > maxDateObj) {
    return `La fecha debe ser anterior a ${maxDateObj.toLocaleDateString()}`;
  }
  return null;
};

/**
 * Valida edad mínima
 */
export const minAge = (minimumAge) => (value) => {
  if (!value) return null;
  
  const birthDate = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < minimumAge) {
    return `Debes tener al menos ${minimumAge} años`;
  }
  return null;
};

// ===============================
// URL Validators
// ===============================

/**
 * Valida URL básica
 */
export const url = (value) => {
  if (!value) return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return 'URL inválida';
  }
};

/**
 * Valida URL con protocolos específicos
 */
export const urlWithProtocols = (allowedProtocols = ['http:', 'https:']) => (value) => {
  const urlError = url(value);
  if (urlError) return urlError;
  
  if (!value) return null;
  
  try {
    const urlObj = new URL(value);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return `Solo se permiten URLs con protocolos: ${allowedProtocols.join(', ')}`;
    }
    return null;
  } catch {
    return 'URL inválida';
  }
};

// ===============================
// File Validators
// ===============================

/**
 * Valida tamaño máximo de archivo
 */
export const maxFileSize = (maxSizeInBytes) => (file) => {
  if (!file) return null;
  
  if (file.size > maxSizeInBytes) {
    const maxSizeMB = (maxSizeInBytes / (1024 * 1024)).toFixed(1);
    return `El archivo no puede exceder ${maxSizeMB}MB`;
  }
  return null;
};

/**
 * Valida tipos de archivo permitidos
 */
export const allowedFileTypes = (allowedTypes) => (file) => {
  if (!file) return null;
  
  if (!allowedTypes.includes(file.type)) {
    return `Solo se permiten archivos de tipo: ${allowedTypes.join(', ')}`;
  }
  return null;
};

/**
 * Valida extensiones de archivo
 */
export const allowedFileExtensions = (allowedExtensions) => (file) => {
  if (!file) return null;
  
  const fileName = file.name || file.uri || '';
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!allowedExtensions.includes(extension)) {
    return `Solo se permiten archivos con extensión: ${allowedExtensions.join(', ')}`;
  }
  return null;
};

// ===============================
// Custom Validators
// ===============================

/**
 * Valida que un valor esté en una lista específica
 */
export const oneOf = (allowedValues) => (value) => {
  if (value === null || value === undefined || value === '') return null;
  
  if (!allowedValues.includes(value)) {
    return `Valor debe ser uno de: ${allowedValues.join(', ')}`;
  }
  return null;
};

/**
 * Valida usando expresión regular
 */
export const pattern = (regex, message = 'Formato inválido') => (value) => {
  if (!value) return null;
  
  if (!regex.test(value)) {
    return message;
  }
  return null;
};

/**
 * Valida función personalizada
 */
export const custom = (validatorFunction, message = 'Valor inválido') => (value) => {
  const isValid = validatorFunction(value);
  return isValid ? null : message;
};

// ===============================
// Composer Functions
// ===============================

/**
 * Combina múltiples validadores
 */
export const compose = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

/**
 * Valida solo si el campo no está vacío
 */
export const optional = (validator) => (value) => {
  if (value === null || value === undefined || value === '' || 
      (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  return validator(value);
};

// ===============================
// Form Validation Helper
// ===============================

/**
 * Valida un formulario completo
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    // Si rules es una función, aplicarla directamente
    if (typeof rules === 'function') {
      const error = rules(value);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
    // Si rules es un array de funciones, aplicar todas
    else if (Array.isArray(rules)) {
      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          isValid = false;
          break; // Solo mostrar el primer error
        }
      }
    }
  }
  
  return { isValid, errors };
};

// ===============================
// Common Validation Schemas
// ===============================

/**
 * Schema de validación para registro de usuario
 */
export const userRegistrationSchema = {
  name: compose(required, minLength(2), maxLength(50)),
  email: compose(required, email),
  phone: compose(required, phone),
  password: compose(required, strongPassword),
  confirmPassword: (formData) => compose(required, confirmPassword(formData.password)),
  country: compose(required, minLength(2)),
};

/**
 * Schema de validación para login
 */
export const loginSchema = {
  email: compose(required, email),
  password: required,
};

/**
 * Schema de validación para perfil
 */
export const profileSchema = {
  name: compose(required, minLength(2), maxLength(50)),
  phone: compose(required, phone),
  country: compose(required, minLength(2)),
};

/**
 * Schema de validación para mensaje de chat
 */
export const chatMessageSchema = {
  message: compose(required, minLength(1), maxLength(1000)),
};

/**
 * Schema de validación para crear sala
 */
export const roomCreationSchema = {
  name: compose(required, minLength(3), maxLength(50)),
  description: optional(maxLength(200)),
  country: required,
  isPrivate: optional(() => null),
};

// ===============================
// Export all validators
// ===============================

export default {
  // Basic
  required,
  minLength,
  maxLength,
  exactLength,
  
  // Email
  email,
  emailWithDomains,
  
  // Password
  password,
  strongPassword,
  confirmPassword,
  
  // Number
  number,
  integer,
  min,
  max,
  range,
  
  // Phone
  phone,
  internationalPhone,
  
  // Date
  date,
  minDate,
  maxDate,
  minAge,
  
  // URL
  url,
  urlWithProtocols,
  
  // File
  maxFileSize,
  allowedFileTypes,
  allowedFileExtensions,
  
  // Custom
  oneOf,
  pattern,
  custom,
  
  // Composers
  compose,
  optional,
  
  // Form
  validateForm,
  
  // Schemas
  userRegistrationSchema,
  loginSchema,
  profileSchema,
  chatMessageSchema,
  roomCreationSchema,
};