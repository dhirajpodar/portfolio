import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { TocHeading } from "@/components/blog/toc-sidebar";

interface PostModule {
  default: ComponentType;
  headings: TocHeading[];
}

const modules: Record<string, () => Promise<PostModule>> = {
  "building-rag-pipelines": () => import("./building-rag-pipelines"),
  "langgraph-multi-agent": () => import("./langgraph-multi-agent"),
  "azure-ml-ops": () => import("./azure-ml-ops"),
};

export const POST_COMPONENTS: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(modules).map(([slug, loader]) => [
    slug,
    dynamic(loader),
  ])
);

export async function getPostHeadings(slug: string): Promise<TocHeading[]> {
  const loader = modules[slug];
  if (!loader) return [];
  const mod = await loader();
  return mod.headings;
}
