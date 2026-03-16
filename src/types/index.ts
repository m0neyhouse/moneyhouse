export type ContractStatus = 'pending' | 'signed' | 'paid' | 'expired';

export interface Contract {
  id: string;
  clientName: string;
  serviceName: string;
  serviceDescription?: string;
  value: number;
  createdAt: string;
  expiresAt: string;
  status: ContractStatus;
  signatureImage?: string;
  signedAt?: string;
  signerIp?: string;
  paymentId?: string;
  paymentUrl?: string;
  paidAt?: string;
}

export interface CreateContractInput {
  clientName: string;
  serviceName: string;
  serviceDescription?: string;
  value: number;
  validityDays?: number;
}

export interface SignContractInput {
  contractId: string;
  signatureImage: string;
  signerIp?: string;
}

export interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
