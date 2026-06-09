"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/app/actions/posts";
import { useRouter } from "next/navigation";

interface UserFilterProps {
  users: User[];
  selectedUserId?: number;
}

export default function UserFilter({ users, selectedUserId }: UserFilterProps) {
  const router = useRouter();

  function handleChange(value: string | null) {
    if (!value || value === "all") {
      router.push("/posts");
    } else {
      router.push(`/posts?userId=${value}`);
    }
  }

  return (
    <Select
      value={selectedUserId ? String(selectedUserId) : "all"}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Filter by author" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All authors</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={String(user.id)}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
