import { getPosts, getUsers } from "@/app/actions/posts";
import PostCard from "./PostCard";
import UserFilter from "./UserFilter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Posts | Blog",
  description: "Browse all blog posts",
};

interface PostsPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { userId: userIdParam } = await searchParams;
  const userId = userIdParam ? Number(userIdParam) : undefined;

  const [postsResult, usersResult] = await Promise.all([
    getPosts(userId),
    getUsers(),
  ]);

  if ("error" in postsResult) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{postsResult.error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const { data: posts } = postsResult;
  const users = "data" in usersResult ? usersResult.data : [];

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <UserFilter users={users} selectedUserId={userId} />
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
