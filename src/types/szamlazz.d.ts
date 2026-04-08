declare module 'szamlazz.js' {
  export class Client {
    constructor(options: {
      authToken?: string;
      user?: string;
      password?: string;
      eInvoice?: boolean;
      requestInvoiceDownload?: boolean;
      downloadedInvoiceCount?: number;
      responseVersion?: number;
      timeout?: number;
    });
    issueInvoice(invoice: Invoice): Promise<{
      invoiceId: string;
      netTotal: string;
      grossTotal: string;
      customerAccountUrl?: string;
      pdf?: Buffer;
    }>;
    getInvoiceData(options: { invoiceId?: string; orderNumber?: string; pdf?: boolean }): Promise<unknown>;
    reverseInvoice(options: {
      invoiceId: string;
      eInvoice: boolean;
      requestInvoiceDownload: boolean;
    }): Promise<{ invoiceId: string; netTotal: string; grossTotal: string; pdf?: Buffer }>;
  }

  export class Invoice {
    constructor(options: {
      paymentMethod?: PaymentMethod;
      currency?: Currency;
      language?: Language;
      seller?: Seller;
      buyer: Buyer;
      items: Item[];
      paid?: boolean;
      orderNumber?: string;
      proforma?: boolean;
      invoiceIdPrefix?: string;
      issueDate?: Date;
      fulfillmentDate?: Date;
      dueDate?: Date;
      comment?: string;
      logoImage?: string;
      exchangeRate?: number;
      exchangeBank?: string;
      noNavReport?: boolean;
      prepaymentInvoice?: boolean;
    });
  }

  export class Buyer {
    constructor(options: {
      name: string;
      zip: string;
      city: string;
      address: string;
      country?: string;
      email?: string;
      sendEmail?: boolean;
      taxSubject?: number;
      taxNumber?: string;
      taxNumberEU?: string;
      identifier?: string;
      issuerName?: string;
      phone?: string;
      comment?: string;
      postAddress?: {
        name?: string;
        country?: string;
        zip?: string;
        city?: string;
        address?: string;
      };
    });
  }

  export class Item {
    constructor(options: {
      label: string;
      quantity: number;
      unit?: string;
      vat: number | string;
      netUnitPrice?: number;
      grossUnitPrice?: number;
      comment?: string;
    });
  }

  export class Seller {
    constructor(options?: {
      bank?: { name: string; accountNumber: string };
      email?: { replyToAddress: string; subject: string; message: string };
      issuerName?: string;
    });
  }

  interface PaymentMethod { value: string }
  interface Currency { value: string; roundPriceExp: number }
  interface Language { value: string }

  export const PaymentMethods: {
    Cash: PaymentMethod;
    BankTransfer: PaymentMethod;
    CreditCard: PaymentMethod;
    PayPal: PaymentMethod;
  };

  export const Currencies: {
    Ft: Currency;
    HUF: Currency;
    EUR: Currency;
    USD: Currency;
  };

  export const Languages: {
    Hungarian: Language;
    English: Language;
    German: Language;
    Italian: Language;
    Romanian: Language;
    Slovak: Language;
  };

  export const TaxSubjects: {
    Unknown: number;
    NoTaxID: number;
    HungarianTaxID: number;
    EUCompany: number;
    NonEUCompany: number;
  };
}
