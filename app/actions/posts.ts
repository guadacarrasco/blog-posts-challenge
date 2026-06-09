"use server";

import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag, updateTag } from "next/cache";

export type PostWithUser = {
  id: number;
  title: string;
  body: string;
  userId: number;
  user: {
    name: string;
    username: string;
  };
};

export type User = {
  id: number;
  name: string;
  username: string;
};

export async function getPosts(
  userId?: number
): Promise<{ data: PostWithUser[] } | { error: string }> {
  'use cache';
  cacheLife('hours');
  cacheTag('posts');
  try {
    const data = await prisma.post.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: {
          select: { name: true, username: true },
        },
      },
      orderBy: { id: "asc" },
    });
    return { data };
  } catch {
    return { error: "Failed to load posts. Please try again." };
  }
}

export async function getUsers(): Promise<
  { data: User[] } | { error: string }
> {
  try {
    const data = await prisma.user.findMany({
      select: { id: true, name: true, username: true },
      orderBy: { id: "asc" },
    });
    return { data };
  } catch {
    return { error: "Failed to load users." };
  }
}

export async function deletePost(
  id: number
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.post.delete({ where: { id } });
    updateTag('posts');
    return { success: true };
  } catch {
    return { error: "Failed to delete post. Please try again." };
  }
}
