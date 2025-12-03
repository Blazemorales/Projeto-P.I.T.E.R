/**
 * Hook: useFormValidation
 * Hook reutilizável para validação de formulários
 *
 * Uso:
 * const { errors, validateField, validateAll, hasErrors, clearErrors } = useFormValidation();
 *
 * validateField('municipio', value, [required('Campo obrigatório')]);
 * if (!hasErrors()) { submitForm(); }
 */

'use client';

import { useState, useCallback } from 'react';

export type ValidationRule = (value: any) => string | null;

export interface ValidationRules {
  [fieldName: string]: ValidationRule[];
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Valida um campo específico
   */
  const validateField = useCallback(
    (name: string, value: any, rules: ValidationRule[]): boolean => {
      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
          return false;
        }
      }

      // Remove erro se passou em todas as regras
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    },
    []
  );

  /**
   * Valida múltiplos campos de uma vez
   */
  const validateAll = useCallback(
    (values: Record<string, any>, rules: ValidationRules): boolean => {
      let isValid = true;

      Object.entries(rules).forEach(([fieldName, fieldRules]) => {
        const fieldValid = validateField(
          fieldName,
          values[fieldName],
          fieldRules
        );
        if (!fieldValid) {
          isValid = false;
        }
      });

      return isValid;
    },
    [validateField]
  );

  /**
   * Verifica se há erros
   */
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  /**
   * Limpa todos os erros
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Limpa erro de um campo específico
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    hasErrors,
    clearErrors,
    clearFieldError,
  };
};

// ===============================================
// REGRAS DE VALIDAÇÃO REUTILIZÁVEIS
// ===============================================

/**
 * Campo obrigatório
 */
export const required = (msg: string = 'Campo obrigatório'): ValidationRule => {
  return (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return msg;
    }
    return null;
  };
};

/**
 * Valida formato de data YYYY-MM-DD
 */
export const validDate = (
  msg: string = 'Data inválida'
): ValidationRule => {
  return (value: string) => {
    if (!value) return null; // Deixa para o required validar

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return msg;
    }
    return null;
  };
};

/**
 * Data não pode ser no futuro
 */
export const notFuture = (
  msg: string = 'Data não pode ser no futuro'
): ValidationRule => {
  return (value: string) => {
    if (!value) return null;

    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fim do dia de hoje

    if (date > today) {
      return msg;
    }
    return null;
  };
};

/**
 * Valida intervalo de datas (início antes de fim)
 */
export const dateRange = (
  startDate: string,
  endDate: string,
  msg: string = 'Data inicial deve ser anterior à data final'
): ValidationRule => {
  return () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return msg;
    }
    return null;
  };
};

/**
 * Período máximo (em dias)
 */
export const maxPeriod = (
  startDate: string,
  endDate: string,
  maxDays: number,
  msg?: string
): ValidationRule => {
  return () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > maxDays) {
      return msg || `Período máximo de ${maxDays} dias`;
    }
    return null;
  };
};

/**
 * Comprimento máximo
 */
export const maxLength = (
  max: number,
  msg?: string
): ValidationRule => {
  return (value: string) => {
    if (!value) return null;

    if (value.length > max) {
      return msg || `Máximo de ${max} caracteres`;
    }
    return null;
  };
};

/**
 * Comprimento mínimo
 */
export const minLength = (
  min: number,
  msg?: string
): ValidationRule => {
  return (value: string) => {
    if (!value) return null;

    if (value.length < min) {
      return msg || `Mínimo de ${min} caracteres`;
    }
    return null;
  };
};

/**
 * Valida código IBGE (7 dígitos)
 */
export const validTerritoryId = (
  msg: string = 'Código de município inválido (deve ter 7 dígitos)'
): ValidationRule => {
  return (value: string) => {
    if (!value) return null;

    if (!/^\d{7}$/.test(value)) {
      return msg;
    }
    return null;
  };
};

/**
 * Regex customizado
 */
export const pattern = (
  regex: RegExp,
  msg: string = 'Formato inválido'
): ValidationRule => {
  return (value: string) => {
    if (!value) return null;

    if (!regex.test(value)) {
      return msg;
    }
    return null;
  };
};

/**
 * Valores devem ser diferentes
 */
export const mustBeDifferent = (
  value1: any,
  value2: any,
  msg: string = 'Valores devem ser diferentes'
): ValidationRule => {
  return () => {
    if (value1 === value2) {
      return msg;
    }
    return null;
  };
};

export default useFormValidation;
