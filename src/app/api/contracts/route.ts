import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createContract, listContracts } from '@/lib/contracts';
import { z } from 'zod';

const createContractSchema = z.object({
  clientName: z.string().min(2).max(100),
  serviceName: z.string().min(2).max(200),
  serviceDescription: z.string().max(500).optional(),
  value: z.number().positive().max(999999),
  validityDays: z.number().int().min(1).max(365).optional(),
});

export async function GET() {
  const isAdmin = await validateSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
  }
  const contracts = await listContracts();
  return NextResponse.json({ success: true, data: contracts });
}

export async function POST(request: NextRequest) {
  const isAdmin = await validateSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const contract = await createContract(parsed.data);
    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao criar contrato:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
