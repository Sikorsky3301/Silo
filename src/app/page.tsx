'use client';

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

const Page = () => {

  const [value, setValue] = useState("");
  
  const trpc = useTRPC();

  const {data : messages} = useQuery(trpc.messages.getmany.queryOptions())

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      toast.success("Message Created");
    },
    onError: () => {
      toast.error("Error Invoking Background Job");
    }
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button disabled={createMessage.isPending} onClick={() => createMessage.mutate({ value: value })}>
          Invoke Background Job
      </Button>
      {JSON.stringify(messages , null , 2 )}
    </div>
  );
};

export default Page;