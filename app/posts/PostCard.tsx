import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostWithUser } from "@/app/actions/posts";
import DeleteButton from "./DeleteButton";

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const excerpt =
    post.body.length > 150 ? post.body.slice(0, 150) + "…" : post.body;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {excerpt}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.user.name}</span>
          <span className="ml-1">@{post.user.username}</span>
        </div>
        <DeleteButton postId={post.id} postTitle={post.title} />
      </CardFooter>
    </Card>
  );
}
