/**
 * Validation utilities for Tunisian phone numbers
 */

// Tunisian phone number patterns
const TUNISIAN_PHONE_PATTERNS = {
  // Mobile numbers: +216 XX XXX XXX or 216 XX XXX XXX
  mobile: /^(\+216|216)?[2-5][0-9]{7}$/,
  // Landline numbers: +216 XX XXX XXX or 216 XX XXX XXX  
  landline: /^(\+216|216)?[7-9][0-9]{7}$/,
  // General Tunisian number (mobile or landline)
  general: /^(\+216|216)?[2-9][0-9]{7}$/
};

/**
 * Validates a Tunisian phone number
 * @param phone - The phone number to validate
 * @returns Object with isValid boolean and formatted number
 */
export const validateTunisianPhone = (phone: string) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it matches Tunisian patterns
  const isValid = TUNISIAN_PHONE_PATTERNS.general.test(cleaned);
  
  // Format the number for display
  let formatted = cleaned;
  if (cleaned.startsWith('+216')) {
    formatted = cleaned;
  } else if (cleaned.startsWith('216')) {
    formatted = '+' + cleaned;
  } else if (cleaned.length === 8 && cleaned.match(/^[2-9]/)) {
    formatted = '+216' + cleaned;
  }
  
  return {
    isValid,
    formatted: isValid ? formatted : phone,
    type: isValid ? getPhoneType(cleaned) : 'invalid'
  };
};

/**
 * Determines the type of Tunisian phone number
 */
const getPhoneType = (phone: string): 'mobile' | 'landline' | 'unknown' => {
  if (TUNISIAN_PHONE_PATTERNS.mobile.test(phone)) {
    return 'mobile';
  } else if (TUNISIAN_PHONE_PATTERNS.landline.test(phone)) {
    return 'landline';
  }
  return 'unknown';
};

/**
 * Formats a Tunisian phone number for display
 */
export const formatTunisianPhone = (phone: string): string => {
  const cleaned = phone.replace(/[^\d]/g, '');
  
  if (cleaned.length === 8) {
    // Format as XX XXX XXX
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 11 && cleaned.startsWith('216')) {
    // Format as +216 XX XXX XXX
    const number = cleaned.substring(3);
    return `+216 ${number.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}`;
  }
  
  return phone;
};

/**
 * Zod schema for Tunisian phone validation
 */
import { z } from 'zod';

export const tunisianPhoneSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .refine((phone) => {
    const validation = validateTunisianPhone(phone);
    return validation.isValid;
  }, {
    message: 'Veuillez entrer un numéro de téléphone tunisien valide (ex: +216 XX XXX XXX)'
  });
