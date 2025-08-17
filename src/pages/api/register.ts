import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name?: string;
  };

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return res.status(409).json({ error: 'Email already registered' });

  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name: name ?? null, hashedPassword },
  });

  return res.status(201).json({ id: user.id });
}
