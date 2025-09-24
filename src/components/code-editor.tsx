"use client";

import Editor, { OnChange, loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

// Monaco editor can have issues with Next.js App Router due to how it loads worker files.
// Using a CDN is a reliable workaround. This must be called before editor is rendered.
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs'
  }
});

interface CodeEditorProps {
  language: string;
  theme: string;
  value: string;
  onChange: OnChange;
  options?: editor.IStandaloneEditorConstructionOptions;
  placeholder?: string;
}

export function CodeEditor({
  language,
  theme,
  value,
  onChange,
  options,
  placeholder,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    editor.onDidFocusEditorWidget(() => setIsFocused(true));
    editor.onDidBlurEditorWidget(() => setIsFocused(false));
  }
  
  const showPlaceholder = !isFocused && (!value || value.length === 0);

  return (
    <div className="w-full h-full font-code relative">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        loading={<Skeleton className="w-full h-full rounded-lg" />}
        options={{
          fontSize: 14,
          minimap: {
            enabled: false,
          },
          contextmenu: false,
          fontFamily: "'Source Code Pro', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          ...options,
        }}
      />
       {showPlaceholder && placeholder && (
        <div 
          className={cn(
            "absolute top-0 left-0 pointer-events-none text-muted-foreground",
            "px-[18px] py-[2px] text-[14px] font-code" // Manual alignment to match Monaco
          )}
          style={{ fontFamily: "'Source Code Pro', monospace" }}
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
