interface PaymentRequest {
  email: string;
  cardHolderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  amount: number;
  currency: string;
  service: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'APPROVED' | 'REJECTED' | 'ERROR' | 'INSUFFICIENT';
  message: string;
  data?: any;
}

class FakePaymentService {
  private apiUrl: string = 'https://fakepayment.onrender.com';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FAKEPAYMENT_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ FAKEPAYMENT_KEY not found in environment variables');
    }
  }

  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🔄 Sending payment request to FakePayment API...');
      console.log('📡 API URL:', this.apiUrl);
      console.log('🔑 Using API Key:', this.apiKey ? 'Present' : 'Missing');
      
      const requestBody = {
        amount: paymentData.amount,
        'card-number': paymentData.cardNumber.replace(/\s/g, ''), // Remove spaces
        cvv: paymentData.cvv,
        'expiration-month': paymentData.expirationMonth,
        'expiration-year': paymentData.expirationYear,
        'full-name': paymentData.cardHolderName,
        currency: paymentData.currency,
        description: paymentData.service,
        reference: paymentData.email
      };
      
      console.log('📤 Request payload:', {
        ...requestBody,
        'card-number': this.maskCardNumber(requestBody['card-number']),
        cvv: '***'
      });

      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Patitas-Moviles/1.0'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 FakePayment API response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ FakePayment API error:', response.status, response.statusText);
        return {
          success: false,
          status: 'ERROR',
          message: `API Error: ${response.status} ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('✅ FakePayment API response:', {
        ...result,
        // Don't log sensitive data
        cardNumber: result.cardNumber ? this.maskCardNumber(result.cardNumber) : undefined
      });

      return {
        success: result.success || false,
        transactionId: result.transactionId || result.id || `fake_${Date.now()}`,
        status: result.status || (result.success ? 'APPROVED' : 'REJECTED'),
        message: result.message || (result.success ? 'Payment processed successfully' : 'Payment failed'),
        data: result.data
      };

    } catch (error) {
      console.error('❌ FakePayment API connection error:', error);
      return {
        success: false,
        status: 'ERROR',
        message: 'Connection error with payment processor'
      };
    }
  }

  private maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return '****';
    return '**** **** **** ' + cardNumber.slice(-4);
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing FakePayment API connection...');
      const response = await fetch(`${this.apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const isConnected = response.ok;
      console.log(isConnected ? '✅ FakePayment API connection successful' : '❌ FakePayment API connection failed');
      return isConnected;
    } catch (error) {
      console.error('❌ FakePayment API connection test failed:', error);
      return false;
    }
  }
}

export default FakePaymentService;
export { PaymentRequest, PaymentResponse };
