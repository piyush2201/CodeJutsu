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
          viewBox="0 0 512 512"
          className="w-8 h-8"
        >
          <path fill="#f4d4a4" d="M299.1 128.3c-2.3-3.6-6-6.3-10.2-6.3h-65.8c-4.2 0-7.9 2.7-10.2 6.3L198.5 154h115l-14.4-25.7z"/>
          <path fill="#50372e" d="M301.7 82.2c-10-16.2-27.1-26.6-45.7-26.6h-0.1c-18.6 0-35.7 10.4-45.7 26.6l-34.4 55.7h160.3l-34.4-55.7z"/>
          <path fill="#2a4b64" d="M110.1 456.4h291.9v-52.1H110.1v52.1z"/>
          <path fill="#d9d9d9" d="M127.3 221.8h257.4v182.5H127.3V221.8z"/>
          <path fill="#f4d4a4" d="M401.9 404.3H110.1v-52.1h291.9v52.1z M127.3 221.8v182.5h257.4V221.8H127.3z" opacity=".2"/>
          <path fill="#f4d4a4" d="M213.2 195.9h85.7v25.9h-85.7z" opacity=".2"/>
          <path fill="#fff" d="M204.6 154h102.8v41.9H204.6z"/>
          <path fill="#2a4b64" d="M307.4 154v41.9h-10.3V154h10.3m-84.2 0v41.9h-10.3V154h10.3m52.1 41.9h-18.5V154h18.5v41.9z"/>
          <path fill="#444" d="M307.4 164.3v21.6h-10.3v-21.6h10.3m-84.2 0v21.6h-10.3v-21.6h10.3m52.1 21.6h-18.5v-21.6h18.5v21.6z"/>
          <path fill="#222" d="M256 364.8c-12.8 0-23.2-10.4-23.2-23.2s10.4-23.2 23.2-23.2s23.2 10.4 23.2 23.2s-10.4 23.2-23.2 23.2zm0-36.8c-7.5 0-13.6 6.1-13.6 13.6s6.1 13.6 13.6 13.6s13.6-6.1 13.6-13.6s-6.1-13.6-13.6-13.6zM294.2 268.3l-13.6 20.4l51.1 34.1l13.6-20.4zM221.8 288.7l-13.6-20.4l-51.1 34.1l13.6 20.4z"/>
          <path fill="#f4d4a4" d="M198.5 154l-34.4 55.7c-5.4 8.8-4.2 20.1 2.9 27.2c3.5 3.5 8.1 5.5 12.8 5.5h21.2v-25.9H184c-3.1 0-5.6-2.5-5.6-5.6c0-1.7 0.8-3.4 2.2-4.5l31.1-23.8l14.4 25.7h-99.3l-14.4-25.7l1.7-1.1c5.4-3.5 8.7-9.5 8.7-15.9c0-10.5-8.5-19-19-19s-19 8.5-19 19c0 6.5 3.2 12.4 8.7 15.9l1.7 1.1l-14.4 25.7h211.8l-14.4-25.7l31.1 23.8c1.4 1.1 2.2 2.7 2.2 4.5c0 3.1-2.5 5.6-5.6 5.6h-17.1v25.9h21.2c4.7 0 9.3-1.9 12.8-5.5c7.1-7.1 8.3-18.4 2.9-27.2l-34.4-55.7h2.6z" opacity=".2"/>
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
