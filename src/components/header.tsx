"use client";

import { Play, Download, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "./ui/separator";
import { DevPilot } from "./dev-pilot";

export type Language = "python" | "java" | "cpp" | "c";
export type Theme = "vs-dark" | "light" | "hc-black";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onCompile: () => void;
  onDownload: () => void;
  isCompiling: boolean;
  onVideoCallToggle: () => void;
  onCodeUpdate: (code: string) => void;
  code: string;
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
  { value: "hc-black", label: "High Contrast" },
];

export function Header({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onCompile,
  onDownload,
  isCompiling,
  onVideoCallToggle,
  onCodeUpdate,
  code,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-3 border-b bg-background shadow-sm">
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 18l-6-6 6-6" stroke="#3b82f6"></path>
          <path d="M14 6l6 6-6 6" stroke="#3b82f6"></path>
          <line x1="12" y1="19" x2="12" y2="5" stroke="#38bdf8" transform="rotate(20 12 12)"></line>
        </svg>
        <h1 className="text-2xl font-bold tracking-tight font-headline text-foreground">
          CodeJutsu
        </h1>
      </div>

      <div className="flex justify-center flex-1">
         <DevPilot
          code={code}
          language={language}
          onCodeUpdate={onCodeUpdate}
          onLanguageChange={onLanguageChange}
        />
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
          <SelectTrigger className="w-[150px]">
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
        
        <Separator orientation="vertical" className="h-8" />

        <Button onClick={onVideoCallToggle} variant="outline" size="sm" className="gap-2">
           <Video />
           Start Call
        </Button>
        
        <Button onClick={onDownload} variant="outline" size="sm" className="gap-2">
          <Download />
          Download
        </Button>

        <Button onClick={onCompile} disabled={isCompiling} size="sm" className="w-[110px] bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 gap-2">
          {isCompiling ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Play />
          )}
          {isCompiling ? "Running" : "Run"}
        </Button>
      </div>
    </header>
  );
}
