"use client";

import { useState } from "react";
import { compileAndRunCode } from "@/ai/flows/compile-and-run-code";
import { Header, type Language, type Theme } from "@/components/header";
import { CodeEditor } from "@/components/code-editor";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const defaultCode: Record<Language, string> = {
  python: 'def main():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    main()',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("python");
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [code, setCode] = useState<string>(defaultCode.python);
  const [output, setOutput] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const { toast } = useToast();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setOutput(""); // Clear output when language changes
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleCompile = async () => {
    if (!code) {
      toast({
        title: "No code to compile",
        description: "Please write some code in the editor before compiling.",
        variant: "destructive",
      });
      return;
    }
    setIsCompiling(true);
    setOutput("Compiling and running...");
    try {
      const result = await compileAndRunCode({ code, language });
      setOutput(result.output);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setOutput(`Error: ${errorMessage}`);
      toast({
        title: "Compilation Failed",
        description: "An error occurred while compiling your code. Please check the output panel.",
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    const fileExtensions: Record<Language, string> = {
      python: ".py",
      java: ".java",
      cpp: ".cpp",
      c: ".c",
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codezero-code${fileExtensions[language]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: `Your code has been downloaded as codezero-code${fileExtensions[language]}.`,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={setTheme}
        onCompile={handleCompile}
        onDownload={handleDownload}
        isCompiling={isCompiling}
      />
      <main className="flex-1 grid grid-rows-2 gap-4 p-4 overflow-hidden">
        <div className="rounded-lg border overflow-hidden shadow-md">
          <CodeEditor
            language={language}
            theme={theme}
            value={code}
            onChange={handleCodeChange}
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2 px-1">Output</h2>
          <Separator className="mb-2"/>
          <ScrollArea className="flex-1 p-4 rounded-lg border bg-muted/20 shadow-inner">
            <pre className="text-sm font-code whitespace-pre-wrap">
              {output || "Output will be displayed here."}
            </pre>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}
