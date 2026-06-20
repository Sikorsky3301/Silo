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

const COMPANIES = [
  { name: "NASA",        src: "/logos/nasa.svg",         h: "h-11" },
  { name: "PlayStation", src: "/logos/playstation.svg",  h: "h-5"  },
  { name: "Meta",        src: "/logos/meta.svg",         h: "h-6"  },
  { name: "SpaceX",      src: "/logos/spacex.svg",       h: "h-5"  },
  { name: "Salesforce",  src: "/logos/salesforce.svg",   h: "h-7"  },
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Ambient radial glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-violet-600/12 via-indigo-500/6 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-r from-violet-500/4 via-indigo-500/4 to-blue-500/4 blur-2xl" />
      </div>

      <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-border/40 relative z-10">
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

      <main className="flex-1 flex flex-col items-center gap-8 px-4 pt-20 pb-20 relative z-10">
        {/* Hero */}
        <div className="text-center space-y-3 max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight">
            What do you want to build?
          </h1>
          <p className="text-muted-foreground text-base">
            Describe your app and Silo writes, runs, and previews it — live.
          </p>
        </div>

        {/* Input box */}
        <div
          className={cn(
            "w-full max-w-2xl rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200",
            isFocused
              ? "shadow-lg ring-1 ring-violet-500/30 border-violet-500/20"
              : "hover:border-border/80",
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
              className="rounded-full size-8 bg-violet-600 hover:bg-violet-500 disabled:bg-muted"
            >
              {createProject.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ArrowUpIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Suggestion chips */}
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

        {/* Trusted by companies */}
        <div className="w-full max-w-2xl pt-4">
          <p className="text-center text-[11px] text-muted-foreground/40 uppercase tracking-widest font-medium mb-8">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {COMPANIES.map((company) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={company.name}
                src={company.src}
                alt={company.name}
                className={cn(
                  "w-auto object-contain select-none cursor-default",
                  "grayscale opacity-25 dark:invert dark:opacity-20",
                  "hover:opacity-50 dark:hover:opacity-40 transition-opacity duration-200",
                  company.h,
                )}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
