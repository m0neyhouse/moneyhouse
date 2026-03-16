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
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
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
    const jsonBlobs = blobs.filter((b) => b.pathname.endsWith('.json'));

    const contracts = await Promise.all(
      jsonBlobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          return (await response.json()) as Contract;
        } catch {
           return null;
        }
      })
    );
    
    // Filtramos os nulls que vieram de falhas no parse
    const validContracts = contracts.filter((c): c is Contract => c !== null);

    return validContracts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.error('List contracts failed:', err);
    return [];
  }
}

export async function signContract(input: SignContractInput): Promise<Contract | null> {
  const contract = await readContract(input.contractId);
  if (!contract || contract.status !== 'pending') return null;

  let signatureUrl = input.signatureImage;

  // Se a imagem veio em Base64, salva o binário no Blob para não estourar tamanho do JSON
  if (input.signatureImage && input.signatureImage.startsWith('data:image/')) {
    try {
      const base64Data = input.signatureImage.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = await put(`${BLOB_PREFIX}signatures/${contract.id}.png`, buffer, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      signatureUrl = blob.url;
    } catch (e) {
      console.error('Erro ao salvar imagem da assinatura no Blob:', e);
      // Fallback para tentar salvar inline se o Blob falhar
    }
  }

  const signed: Contract = {
    ...contract,
    status: 'signed',
    signatureImage: signatureUrl,
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

export async function updatePaymentStatus(contractId: string, status: Contract['status']): Promise<Contract | null> {
  const contract = await readContract(contractId);
  if (!contract) return null;

  const updated: Contract = { ...contract, status };
  await saveContract(updated);
  return updated;
}
