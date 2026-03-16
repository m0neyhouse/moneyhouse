import { put, head, list } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import type { Contract, CreateContractInput, SignContractInput } from '@/types';

const BLOB_PREFIX = 'contracts/';

async function readContract(id: string): Promise<Contract | null> {
  try {
    const blobHead = await head(`${BLOB_PREFIX}${id}.json`);
    const response = await fetch(blobHead.url);
    return (await response.json()) as Contract;
  } catch {
    return null;
  }
}

async function saveContract(contract: Contract): Promise<void> {
  await put(`${BLOB_PREFIX}${contract.id}.json`, JSON.stringify(contract), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function createContract(input: CreateContractInput): Promise<Contract> {
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

  await saveContract(contract);
  return contract;
}

export async function getContract(id: string): Promise<Contract | null> {
  const contract = await readContract(id);
  if (!contract) return null;

  if (contract.status === 'pending') {
    const now = new Date();
    const expires = new Date(contract.expiresAt);
    if (now > expires) {
      const expired = { ...contract, status: 'expired' as const };
      await saveContract(expired);
      return expired;
    }
  }

  return contract;
}

export async function listContracts(): Promise<Contract[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    const contracts = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        return (await response.json()) as Contract;
      })
    );
    return contracts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function signContract(input: SignContractInput): Promise<Contract | null> {
  const contract = await readContract(input.contractId);
  if (!contract || contract.status !== 'pending') return null;

  const signed: Contract = {
    ...contract,
    status: 'signed',
    signatureImage: input.signatureImage,
    signedAt: new Date().toISOString(),
    signerIp: input.signerIp,
  };

  await saveContract(signed);
  return signed;
}

export async function updatePayment(
  contractId: string,
  paymentId: string,
  paymentUrl: string
): Promise<Contract | null> {
  const contract = await readContract(contractId);
  if (!contract) return null;

  const updated: Contract = { ...contract, paymentId, paymentUrl };
  await saveContract(updated);
  return updated;
}
