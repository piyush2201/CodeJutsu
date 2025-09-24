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
          viewBox="0 0 48 48"
          width="36"
          height="36"
        >
          <path fill="#a5d6a7" d="M24 6c-8.8 0-16 7.2-16 16v0c0 4.4 1.8 8.4 4.7 11.3l-1.7 1.7c-2-2-3-5.2-3-8h-2c0 3.2.9 6.2 2.7 8.7l-2.4 2.4c-1.2-1.2-2.1-2.7-2.6-4.3H2c.5 2 1.6 3.8 3.1 5.3L-.2 44.3c1.4 1.4 3.5 1.4 4.9 0l4.3-4.3c1.5 1.5 3.3 2.6 5.3 3.1v-2.3c-1.6-.5-3.1-1.4-4.3-2.6l2.4-2.4c2.5 1.8 5.5 2.7 8.7 2.7v2c-3.7 0-7.2-1.1-10-3l1.7-1.7c2.9 2.9 6.9 4.7 11.3 4.7s8.4-1.8 11.3-4.7l1.7 1.7c-2.8 1.9-6.3 3-10 3v-2c3.2 0 6.2-.9 8.7-2.7l2.4 2.4c-1.2 1.2-2.7 2.1-4.3 2.6v2.3c2-.5 3.8-1.6 5.3-3.1l4.3 4.3c1.4 1.4 3.5 1.4 4.9 0l-5.3-5.3c1.5-1.5 2.6-3.3 3.1-5.3h-2.3c-.5 1.6-1.4 3.1-2.6 4.3l-2.4-2.4c1.8-2.5 2.7-5.5 2.7-8.7v-2c-2.8 0-6-.9-8-2.7l1.7-1.7C38.2 30.4 40 26.4 40 22c0-8.8-7.2-16-16-16z"/>
          <path fill="#e57373" d="M35.1 12.3c-2.1-2.1-5-3.3-8.1-3.3h-6c-3.1 0-6 .2-8.1 2.3l-3.9 3.9h34z"/>
          <path fill="#fdd835" d="M12 28c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm26 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
          <circle fill="#212121" cx="17" cy="18" r="2"/>
          <circle fill="#212121" cx="31" cy="18" r="2"/>
          <path fill="#ffc107" d="M14 26h20v2H14z"/>
          <path fill="#4caf50" d="M14 28h20v10H14z"/>
          <path d="M24 20c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="#ffeb3b"/>
          <path fill="#4caf50" d="M12 38h24v2H12zm-2 2h28v2H10zm2 2h24v2H12z"/>
          <path d="M47 13l-6-6-2 2 6 6 2-2z" fill="#9e9e9e"/>
          <path d="M41 7l-2 2-6-6 2-2 6 6z" fill="#bdbdbd"/>
          <path d="M39 9l-6-6-2 2 6 6 2-2z" fill="#e0e0e0"/>
          <path d="M43 9l2-2-6-6-2 2zm-2 2l-6-6-2 2 6 6z" fill="#brown"/>
          <path d="M39.6 15.6l-3-3-1.4 1.4 3 3z" fill="#795548"/>
          <path d="M21.5 28.5l-3 5-1.7-1 3-5zM26.5 33.5l-3-5-1.7 1 3 5z" fill="#2196f3"/>
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
