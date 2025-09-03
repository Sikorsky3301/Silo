'use client';

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {

  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background Job Invoked");
    },
    onError: () => {
      toast.error("Error Invoking Background Job");
    }
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ text: 'John' })}>
          Invoke Background Job
      </Button>
    </div>
  );
};

export default Page;