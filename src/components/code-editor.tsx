"use client";

import Editor, { OnChange, loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useRef } from "react";
import { Skeleton } from "./ui/skeleton";

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
}

export function CodeEditor({
  language,
  theme,
  value,
  onChange,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  return (
    <div className="w-full h-full font-code">
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
        }}
      />
    </div>
  );
}
