import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateAdminPassword, createSession, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  password: z.string().min(1, 'Senha obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    const isValid = await validateAdminPassword(parsed.data.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 });
    }

    const token = await createSession();
    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
