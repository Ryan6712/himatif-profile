import { marked } from "marked";

// Basic config for marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function parseMarkdown(content: string): string {
  if (!content) return "";
  return marked.parse(content) as string;
}