"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface Props {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId }),
  );
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-12 border-b flex items-center px-3 gap-2 bg-background shrink-0">
      <Link href="/">
        <Button variant="ghost" size="icon" className="size-8">
          <ChevronLeftIcon className="size-4" />
        </Button>
      </Link>

      <div className="flex items-center gap-2 min-w-0">
        <Image
          src="/logo.svg"
          alt="Silo"
          width={18}
          height={18}
          className="shrink-0"
        />
        <span className="text-sm font-medium truncate">{project.name}</span>
      </div>

      <div className="ml-auto">
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
      </div>
    </header>
  );
};
