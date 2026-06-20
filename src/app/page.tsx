"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Build a Kanban board with drag-and-drop",
  "Create a personal finance dashboard",
  "Make a Pomodoro timer with task list",
  "Design an e-commerce product page",
  "Build a markdown notes app with preview",
  "Create a weather app with animated icons",
];

const Page = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { theme, setTheme } = useTheme();

  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSuccess: (data) => router.push(`/projects/${data.id}`),
    }),
  );

  const handleSubmit = () => {
    if (!value.trim() || createProject.isPending) return;
    createProject.mutate({ value: value.trim() });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Silo" width={22} height={22} />
          <span className="font-semibold text-sm tracking-tight">Silo</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 -mt-6">
        <div className="text-center space-y-3 max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight">
            What do you want to build?
          </h1>
          <p className="text-muted-foreground text-base">
            Describe your app and Silo will write and deploy it in seconds.
          </p>
        </div>

        <div
          className={cn(
            "w-full max-w-2xl rounded-2xl border bg-card p-4 shadow-sm transition-all duration-150",
            isFocused && "shadow-md ring-1 ring-ring/50",
          )}
        >
          <TextareaAutosize
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={createProject.isPending}
            minRows={3}
            maxRows={10}
            className="w-full resize-none border-none outline-none bg-transparent text-sm placeholder:text-muted-foreground leading-relaxed"
            placeholder="Build me a Kanban board with drag and drop, labels, and due dates..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-3">
            <span className="text-xs text-muted-foreground font-mono">
              <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span>⌘</span>Enter
              </kbd>{" "}
              to submit
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!value.trim() || createProject.isPending}
              size="icon"
              className="rounded-full size-8"
            >
              {createProject.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ArrowUpIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              disabled={createProject.isPending}
              className="text-xs px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Page;
