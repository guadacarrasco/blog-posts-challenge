import { PrismaClient } from "../generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

interface JsonUser {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface JsonPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const [usersRes, postsRes] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/users"),
    fetch("https://jsonplaceholder.typicode.com/posts"),
  ]);

  if (!usersRes.ok || !postsRes.ok) {
    throw new Error("Failed to fetch seed data from JSONPlaceholder");
  }

  const users: JsonUser[] = await usersRes.json();
  const posts: JsonPost[] = await postsRes.json();

  await prisma.user.createMany({
    data: users.map(({ id, name, username, email }) => ({
      id,
      name,
      username,
      email,
    })),
  });

  await prisma.post.createMany({
    data: posts.map(({ id, userId, title, body }) => ({
      id,
      userId,
      title,
      body,
    })),
  });

  console.log(`Seeded ${users.length} users and ${posts.length} posts.`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
