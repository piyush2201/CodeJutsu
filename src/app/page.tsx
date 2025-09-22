"use client";

import { useState, KeyboardEvent } from "react";
import { compileAndRunCode } from "@/ai/flows/compile-and-run-code";
import { Header, type Language, type Theme } from "@/components/header";
import { CodeEditor } from "@/components/code-editor";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

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
  const [output, setOutput] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const { toast } = useToast();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setOutput("");
    setStdin("");
    setIsWaitingForInput(false);
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleCompile = async (currentStdin: string = "") => {
    if (!code) {
      toast({
        title: "No code to compile",
        description: "Please write some code in the editor before compiling.",
        variant: "destructive",
      });
      return;
    }
    setIsCompiling(true);
    setIsWaitingForInput(false);

    // Append user input to output to simulate terminal interaction
    if (currentStdin) {
      setOutput(prev => `${prev}${currentStdin}\n`);
    } else {
      // Clear output for new run
      setOutput("");
    }
    
    // Add a marker for compiling
    setOutput(prev => prev + "Compiling and running...\n");


    try {
      const result = await compileAndRunCode({ code, language, stdin: currentStdin });
      const newOutput = result.output;
      
      setOutput(prev => prev.replace("Compiling and running...\n", "") + newOutput);

      if (newOutput.toLowerCase().includes("enter") || newOutput.toLowerCase().includes("input")) {
        setIsWaitingForInput(true);
      } else {
        setIsWaitingForInput(false);
      }

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setOutput(prev => prev.replace("Compiling and running...\n", `Error: ${errorMessage}\n`));
      toast({
        title: "Execution Failed",
        description: "An error occurred while running your code. Please check the output panel.",
        variant: "destructive",
      });
      setIsWaitingForInput(false);
    } finally {
      setIsCompiling(false);
      setStdin(""); // Clear stdin input field after submission
    }
  };

  const handleSubmitInput = () => {
    if(stdin.trim()){
      // The `handleCompile` function is now used to send subsequent inputs as well.
      // The AI flow is designed to handle this statefully.
      setOutput(prev => `${prev}${stdin}\n`);
      handleCompile(stdin);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInput();
    }
  }

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
        onCompile={() => handleCompile()}
        onDownload={handleDownload}
        isCompiling={isCompiling}
      />
      <main className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
        <div className="flex flex-col gap-4 flex-[3]">
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

        <div className="flex flex-col gap-2 flex-[2]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold px-1">Output</h2>
            </div>
            <Separator />
            <div className="flex flex-col flex-1 gap-2">
              <ScrollArea className="flex-1 p-4 rounded-lg border bg-muted/20 shadow-inner">
                  <pre className="text-sm font-code whitespace-pre-wrap">
                  {output || "Output will be displayed here."}
                  </pre>
              </ScrollArea>
              {isWaitingForInput && (
                <div className="relative">
                  <Textarea
                    placeholder="Type your input here..."
                    className="w-full pr-20 font-code"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isCompiling}
                    rows={1}
                  />
                  <Button 
                    className="absolute right-2 top-1/2 -translate-y-1/2" 
                    size="sm" 
                    onClick={handleSubmitInput} 
                    disabled={isCompiling}
                  >
                    <Paperclip className="mr-2" />
                    Submit
                  </Button>
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
}
