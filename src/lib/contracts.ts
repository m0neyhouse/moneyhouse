import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Contract, CreateContractInput, SignContractInput } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'contracts.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readContracts(): Contract[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Contract[];
}

function writeContracts(contracts: Contract[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(contracts, null, 2), 'utf-8');
}

export function createContract(input: CreateContractInput): Contract {
  const contracts = readContracts();
  const validityDays = input.validityDays ?? 7;
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + validityDays);

  const contract: Contract = {
    id: uuidv4(),
    clientName: input.clientName.trim(),
    serviceName: input.serviceName.trim(),
    serviceDescription: input.serviceDescription?.trim(),
    value: input.value,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
  };

  contracts.push(contract);
  writeContracts(contracts);
  return contract;
}

export function getContract(id: string): Contract | null {
  const contracts = readContracts();
  const contract = contracts.find((c) => c.id === id) ?? null;

  if (contract && contract.status === 'pending') {
    const now = new Date();
    const expires = new Date(contract.expiresAt);
    if (now > expires) {
      markAsExpired(id);
      return { ...contract, status: 'expired' };
    }
  }

  return contract;
}

export function listContracts(): Contract[] {
  return readContracts().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function signContract(input: SignContractInput): Contract | null {
  const contracts = readContracts();
  const index = contracts.findIndex((c) => c.id === input.contractId);
  if (index === -1) return null;

  const contract = contracts[index];
  if (contract.status !== 'pending') return null;

  contracts[index] = {
    ...contract,
    status: 'signed',
    signatureImage: input.signatureImage,
    signedAt: new Date().toISOString(),
    signerIp: input.signerIp,
  };

  writeContracts(contracts);
  return contracts[index];
}

export function updatePayment(contractId: string, paymentId: string, paymentUrl: string): Contract | null {
  const contracts = readContracts();
  const index = contracts.findIndex((c) => c.id === contractId);
  if (index === -1) return null;

  contracts[index] = {
    ...contracts[index],
    paymentId,
    paymentUrl,
  };

  writeContracts(contracts);
  return contracts[index];
}

function markAsExpired(id: string) {
  const contracts = readContracts();
  const index = contracts.findIndex((c) => c.id === id);
  if (index !== -1) {
    contracts[index].status = 'expired';
    writeContracts(contracts);
  }
}
