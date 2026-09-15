/**
 * Pakistani Phone Number Validation & Formatting Utility
 * IronAsh Himalayan Herbal Store
 *
 * Supported formats:
 * - Local mobile: 03XX XXXXXXX (11 digits, e.g. 0300 1234567)
 * - International mobile: +92 3XX XXXXXXX (e.g. +92 300 1234567)
 * - Raw: 923XXXXXXXXX, 00923XXXXXXXXX
 *
 * Supported Mobile Codes:
 * - 0300-0309: Jazz / Mobilink
 * - 0310-0318: Zong
 * - 0320-0325: Warid
 * - 0330-0337: Ufone
 * - 0340-0349: Telenor
 * - 0355: SCOM (Gilgit-Baltistan / Azad Kashmir)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
  normalized?: string;
  carrier?: string;
}

/**
 * Identify Pakistani telecom carrier from the 4-digit mobile code (e.g. 0300)
 */
export function getPakistaniCarrier(code: string): string {
  const num = parseInt(code, 10);
  if (num >= 300 && num <= 309) return 'Jazz';
  if (num >= 310 && num <= 318) return 'Zong';
  if (num >= 320 && num <= 325) return 'Warid';
  if (num >= 330 && num <= 337) return 'Ufone';
  if (num >= 340 && num <= 349) return 'Telenor';
  if (num === 355) return 'SCOM (Gilgit-Baltistan)';
  return 'Pakistani Mobile';
}

/**
 * Validates whether a given string is a valid Pakistani mobile number
 */
export function validatePakistaniPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      error: 'Phone number is required for Cash on Delivery dispatch.',
    };
  }

  const trimmed = input.trim();

  // Extract pure digits
  const digitsOnly = trimmed.replace(/\D/g, '');

  // Check if non-digits were entered other than +, -, spaces, parentheses
  if (/[^0-9+\s\-()]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter numbers only (e.g. 0300 1234567).',
    };
  }

  // Normalize digits to 11-digit local format: 03XXXXXXXXX
  let normalizedDigits = '';

  if (digitsOnly.startsWith('00923') && digitsOnly.length === 14) {
    normalizedDigits = '0' + digitsOnly.slice(4); // 0092 300 1234567 -> 03001234567
  } else if (digitsOnly.startsWith('923') && digitsOnly.length === 12) {
    normalizedDigits = '0' + digitsOnly.slice(2); // 92 300 1234567 -> 03001234567
  } else if (digitsOnly.startsWith('03') && digitsOnly.length === 11) {
    normalizedDigits = digitsOnly; // 03001234567
  } else if (digitsOnly.startsWith('3') && digitsOnly.length === 10) {
    normalizedDigits = '0' + digitsOnly; // 3001234567 -> 03001234567
  } else {
    // Determine the specific reason for failure
    if (digitsOnly.startsWith('0092') || digitsOnly.startsWith('92') || trimmed.startsWith('+92')) {
      if (digitsOnly.length < 12) {
        return {
          isValid: false,
          error: 'Incomplete Pakistani number. Please enter all 11 digits (e.g. +92 300 1234567).',
        };
      }
      if (digitsOnly.length > 12) {
        return {
          isValid: false,
          error: 'Number has too many digits. Pakistani mobile numbers have 11 digits.',
        };
      }
      // Doesn't start with 3 after 92
      return {
        isValid: false,
        error: 'Only Pakistani mobile numbers starting with 3 are supported (e.g. +92 300 1234567).',
      };
    }

    if (digitsOnly.startsWith('0')) {
      if (!digitsOnly.startsWith('03')) {
        return {
          isValid: false,
          error: 'Only Pakistani mobile numbers starting with 03XX are supported (e.g. 0300 1234567).',
        };
      }
      if (digitsOnly.length < 11) {
        return {
          isValid: false,
          error: `Incomplete number (${digitsOnly.length}/11 digits). Enter 11 digits (e.g. 0300 1234567).`,
        };
      }
      if (digitsOnly.length > 11) {
        return {
          isValid: false,
          error: 'Number is too long. Pakistani mobile numbers must be 11 digits (e.g. 0300 1234567).',
        };
      }
    }

    // Foreign numbers or invalid starting digit
    return {
      isValid: false,
      error: 'Only Pakistani mobile numbers are supported (e.g. 0300 1234567 or +92 300 1234567).',
    };
  }

  // Validate the 4-digit network code: 0300 to 0355
  const networkCode = normalizedDigits.slice(1, 4); // '300' to '355'
  const codeNum = parseInt(networkCode, 10);
  const isValidCode = (codeNum >= 300 && codeNum <= 349) || codeNum === 355;

  if (!isValidCode) {
    return {
      isValid: false,
      error: `Invalid Pakistani mobile network prefix (0${networkCode}). Valid prefixes are 0300-0349 & 0355.`,
    };
  }

  // Format canonical display: 0300 1234567
  const part1 = normalizedDigits.slice(0, 4);
  const part2 = normalizedDigits.slice(4);
  const formatted = `${part1} ${part2}`;
  const intlFormatted = `+92 ${part1.slice(1)} ${part2}`;

  return {
    isValid: true,
    formatted: formatted,
    normalized: intlFormatted,
    carrier: getPakistaniCarrier(networkCode),
  };
}

/**
 * Real-time input formatter as user types.
 * Keeps input friendly while enforcing Pakistani format.
 */
export function formatPakistaniInput(raw: string): string {
  if (!raw) return '';

  // Preserve leading '+' if present
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (hasPlus) {
    // Format as: +92 3XX XXXXXXX
    if (digits.startsWith('92')) {
      const rest = digits.slice(2);
      if (rest.length === 0) return '+92 ';
      if (rest.length <= 3) return `+92 ${rest}`;
      return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
    }
    // If just + with other digits
    if (digits.length <= 2) return `+${digits}`;
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 12)}`;
  }

  // Local format: 03XX XXXXXXX
  if (digits.startsWith('92') && digits.length >= 2) {
    // User typed 92 without +
    const rest = digits.slice(2);
    if (rest.length <= 3) return `0${rest}`;
    return `0${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
  }

  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)} ${digits.slice(4, 11)}`;
}
