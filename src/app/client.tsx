"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
    const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.CreateAI.queryOptions({ text: 'client component running' }));
  return (
    <div>
        <h1>Client Component</h1>
        <p>{data.greeting}</p>
    </div>
  );
};
