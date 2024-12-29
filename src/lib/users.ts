import prisma from '@/lib/prisma';

export async function getUsers() {
  return await prisma.user.findMany();
}

export async function createUser(data: { name: string; email: string }) {
  return await prisma.user.create({
    data,
  });
}
