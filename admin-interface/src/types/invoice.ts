export interface Invoice {
  id: number;
  code: string;
  userId: number;
  bookingId: number;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  id?: number;
  code?: string;
  userId: number;
  bookingId: number;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'CANCELLED';
} 