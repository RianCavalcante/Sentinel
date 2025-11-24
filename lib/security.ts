// Utilitários de segurança para o Sentinel Dashboard

/**
 * Sanitiza termo de busca para prevenir SQL injection
 * Remove caracteres especiais que podem ser usados em ataques
 */
export function sanitizeSearchTerm(term: string): string {
  if (!term) return '';
  
  // Remove caracteres perigosos para SQL LIKE
  // % _ \ são wildcards que podem ser explorados
  return term
    .replace(/[%_\\]/g, '\\$&')
    .trim()
    .substring(0, 100); // Limita tamanho
}

/**
 * Valida e sanitiza input genérico
 * Remove HTML/scripts perigosos
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script>
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove <iframe>
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc)
    .trim();
}

/**
 * Logger condicional - só loga em desenvolvimento
 */
export function devLog(...args: any[]): void {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}

/**
 * Logger de erro - sempre loga mas sanitiza dados sensíveis
 */
export function errorLog(message: string, error?: any): void {
  const sanitizedError = error ? {
    message: error.message,
    name: error.name,
    // Não loga stack trace em produção
    ...(import.meta.env.DEV && { stack: error.stack })
  } : undefined;
  
  console.error(message, sanitizedError);
}

/**
 * Valida URL para prevenir open redirect
 */
export function isValidUrl(url: string, allowedOrigins: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedOrigins.some(origin => parsed.origin === origin);
  } catch {
    return false;
  }
}

/**
 * Valida UUID para prevenir injection
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
