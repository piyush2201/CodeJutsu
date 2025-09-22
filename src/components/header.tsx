"use client";

import { Play, Download, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Language = "python" | "java" | "cpp" | "c";
export type Theme = "vs-dark" | "light";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onCompile: () => void;
  onDownload: () => void;
  isCompiling: boolean;
}

const languages: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

const themes: { value: Theme; label: string }[] = [
  { value: "vs-dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function Header({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onCompile,
  onDownload,
  isCompiling,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-3 border-b bg-background shadow-sm">
      <div className="flex items-center gap-3">
        <Code2 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight font-headline text-foreground">
          CodeZero
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Select value={language} onValueChange={(value) => onLanguageChange(value as Language)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={theme} onValueChange={(value) => onThemeChange(value as Theme)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {themes.map((th) => (
              <SelectItem key={th.value} value={th.value}>
                {th.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onDownload} variant="outline">
          <Download className="mr-2" />
          Download
        </Button>

        <Button onClick={onCompile} disabled={isCompiling} className="w-[180px] bg-accent text-accent-foreground hover:bg-accent/90">
          {isCompiling ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <Play className="mr-2" />
          )}
          {isCompiling ? "Compiling..." : "Compile & Run"}
        </Button>
      </div>
    </header>
  );
}
