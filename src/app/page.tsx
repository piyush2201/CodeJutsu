"use client";

import { useState } from "react";
import { compileAndRunCode } from "@/ai/flows/compile-and-run-code";
import { Header, type Language, type Theme } from "@/components/header";
import { CodeEditor } from "@/components/code-editor";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const defaultCode: Record<Language, string> = {
  python: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
  java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}',
  cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "Enter your name: ";\n    std::getline(std::cin, name);\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    char name[50];\n    printf("Enter your name: ");\n    fgets(name, 50, stdin);\n    printf("Hello, %s", name);\n    return 0;\n}',
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("python");
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [code, setCode] = useState<string>(defaultCode.python);
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const { toast } = useToast();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setOutput(""); // Clear output when language changes
    setStdin(""); // Clear input when language changes
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
      const result = await compileAndRunCode({ code, language, stdin });
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
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold px-1">Code Editor</h2>
            <Separator />
            <div className="rounded-lg border overflow-hidden shadow-md flex-1">
              <CodeEditor
                language={language}
                theme={theme}
                value={code}
                onChange={handleCodeChange}
              />
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold px-1">Input (stdin)</h2>
                <Separator />
                <Textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Provide standard input to your program here."
                    className="h-32 font-code"
                />
            </div>
            <div className="flex flex-col flex-1 gap-2">
                <h2 className="text-lg font-semibold px-1">Output</h2>
                <Separator />
                <ScrollArea className="flex-1 p-4 rounded-lg border bg-muted/20 shadow-inner">
                    <pre className="text-sm font-code whitespace-pre-wrap">
                    {output || "Output will be displayed here."}
                    </pre>
                </ScrollArea>
            </div>
        </div>
      </main>
    </div>
  );
}
