import axios, { AxiosInstance } from 'axios';

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
}

interface PayPalOrder {
  id: string;
  status: string;
  payer: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
  }>;
}

interface PayPalSubscription {
  id: string;
  status: string;
  start_time: string;
}

export class PayPalClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: PayPalConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = config.mode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in response.data.expires_in seconds, refresh at 90%
      this.tokenExpiry = Date.now() + (response.data.expires_in * 900);

      return this.accessToken;
    } catch (error) {
      console.error('PayPal: Failed to get access token', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  async createOrder(amount: string, currency: string = 'USD', reference: string = ''): Promise<string> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post('/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: reference,
            amount: {
              currency_code: currency,
              value: amount,
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
              user_action: 'PAY_NOW',
              brand_name: 'BudgetMind',
            },
          },
        },
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data.id;
    } catch (error: any) {
      console.error('PayPal: Failed to create order', error.response?.data || error);
      throw new Error('Failed to create PayPal order');
    }
  }

  async captureOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        `/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal: Failed to capture order', error.response?.data || error);
      throw new Error('Failed to capture PayPal order');
    }
  }

  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(
        `/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal: Failed to get order', error.response?.data || error);
      throw new Error('Failed to fetch PayPal order');
    }
  }

  async createSubscription(planId: string, email: string, returnUrl: string): Promise<string> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post('/v1/billing/subscriptions', {
        plan_id: planId,
        subscriber: {
          email_address: email,
        },
        application_context: {
          brand_name: 'BudgetMind',
          return_url: returnUrl,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
          user_action: 'SUBSCRIBE_NOW',
        },
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data.id;
    } catch (error: any) {
      console.error('PayPal: Failed to create subscription', error.response?.data || error);
      throw new Error('Failed to create PayPal subscription');
    }
  }

  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(
        `/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal: Failed to get subscription', error.response?.data || error);
      throw new Error('Failed to fetch PayPal subscription');
    }
  }

  async suspendSubscription(subscriptionId: string, reason: string = 'Requested by user'): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await this.client.post(
        `/v1/billing/subscriptions/${subscriptionId}/suspend`,
        {
          reason,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      console.error('PayPal: Failed to suspend subscription', error.response?.data || error);
      throw new Error('Failed to suspend PayPal subscription');
    }
  }

  async cancelSubscription(subscriptionId: string, reason: string = 'Requested by user'): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await this.client.post(
        `/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {
          reason,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      console.error('PayPal: Failed to cancel subscription', error.response?.data || error);
      throw new Error('Failed to cancel PayPal subscription');
    }
  }

  verifyWebhookSignature(
    transmissionId: string,
    transmissionTime: string,
    certUrl: string,
    authAlgo: string,
    transmissionSig: string,
    webhookBody: string
  ): boolean {
    // Note: Full implementation would verify signature cryptographically
    // For now, this is a placeholder. In production, use PayPal's webhook validation
    console.log('[PayPal] Webhook signature verification - implement full validation in production');
    return true;
  }
}

export const initPayPalClient = (): PayPalClient => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = (process.env.PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
  }

  return new PayPalClient({
    clientId,
    clientSecret,
    mode,
  });
};
