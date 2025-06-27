import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    lng: 'es', // default language
    fallbackLng: 'es',
    debug: false,
    
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json')
    },
    
    detection: {
      order: ['cookie', 'header', 'querystring'],
      caches: ['cookie'],
      cookieName: 'i18next',
      cookieOptions: {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: false,
        sameSite: 'lax'
      }
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;

// Helper functions for localization
export class LocalizationService {
  static formatDate(date: Date, locale: string): string {
    if (locale === 'es') {
      // Spanish format: DD/MM/YYYY HH:mm
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      // English format: MM/DD/YYYY HH:mm AM/PM
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  static formatCurrency(amount: number, locale: string): string {
    if (locale === 'es') {
      // Spanish (Venezuela): VES 1.500,00 Bs
      const formattedAmount = amount.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `VES ${formattedAmount} Bs`;
    } else {
      // English (US): USD $15.00
      const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `USD $${formattedAmount}`;
    }
  }

  static formatNumber(number: number, locale: string): string {
    if (locale === 'es') {
      return number.toLocaleString('es-ES');
    } else {
      return number.toLocaleString('en-US');
    }
  }

  static getCurrencySymbol(locale: string): string {
    return locale === 'es' ? 'Bs' : '$';
  }

  static getCurrencyCode(locale: string): string {
    return locale === 'es' ? 'VES' : 'USD';
  }
}

export { middleware };
