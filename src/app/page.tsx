'use client';

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.CreateAI.queryOptions({ text: 'client' }));

  return (
    <div>
      {JSON.stringify(data)}
    </div>
  );
};

export default Page;