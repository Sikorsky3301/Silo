"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface Props {
  files: Record<string, string>;
}

export const CodeView = ({ files }: Props) => {
  const filePaths = Object.keys(files);
  const [activeFile, setActiveFile] = useState<string>(filePaths[0] ?? "");

  if (filePaths.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No files available.
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-52 shrink-0 border-r bg-muted/20">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-0.5">
            {filePaths.map((path) => (
              <button
                key={path}
                onClick={() => setActiveFile(path)}
                title={path}
                className={cn(
                  "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs font-mono truncate transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeFile === path &&
                    "bg-accent text-accent-foreground font-medium",
                )}
              >
                <FileIcon className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{path.split("/").pop() ?? path}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-hidden bg-background">
        <ScrollArea className="h-full">
          {activeFile && files[activeFile] !== undefined ? (
            <pre className="p-4 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words text-foreground">
              <code>{files[activeFile]}</code>
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select a file to view its contents.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
