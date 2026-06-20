"use client";

import { Fragment } from "@/generated/prisma";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExternalLinkIcon, CodeIcon, MonitorIcon } from "lucide-react";
import { CodeView } from "./code-view";

interface Props {
  fragment: Fragment | null;
}

export const FragmentView = ({ fragment }: Props) => {
  if (!fragment) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <MonitorIcon className="size-10 opacity-20" />
        <p className="text-sm">Submit a prompt to generate your app</p>
      </div>
    );
  }

  const files = fragment.files as Record<string, string>;

  return (
    <Tabs defaultValue="preview" className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 border-b shrink-0 h-10 bg-background">
        <TabsList className="h-7 gap-0.5">
          <TabsTrigger value="preview" className="text-xs h-6 gap-1.5 px-2.5">
            <MonitorIcon className="size-3" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs h-6 gap-1.5 px-2.5">
            <CodeIcon className="size-3" />
            Code
          </TabsTrigger>
        </TabsList>
        <a
          href={fragment.sandboxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLinkIcon className="size-3" />
          Open
        </a>
      </div>

      <TabsContent
        value="preview"
        className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
      >
        <iframe
          src={fragment.sandboxUrl}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="App preview"
        />
      </TabsContent>

      <TabsContent
        value="code"
        className="flex-1 min-h-0 mt-0 overflow-hidden data-[state=inactive]:hidden"
      >
        <CodeView files={files} />
      </TabsContent>
    </Tabs>
  );
};
