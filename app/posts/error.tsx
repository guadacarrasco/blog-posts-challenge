"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PostsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3">
          <span>
            {error.message || "An unexpected error occurred while loading posts."}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={unstable_retry}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
