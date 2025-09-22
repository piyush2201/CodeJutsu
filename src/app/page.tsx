"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { compileAndRunCode } from "@/ai/flows/compile-and-run-code";
import { Header, type Language, type Theme } from "@/components/header";
import { CodeEditor } from "@/components/code-editor";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Phone, Video } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const defaultCode: Record<Language, string> = {
  python: 'import time\n\nprint("--- Countdown Timer ---")\nwhile True:\n    try:\n        num_str = input("Enter a positive number to count down from: ")\n        num = int(num_str)\n        if num <= 0:\n            print("Please enter a positive number.")\n            continue\n\n        for i in range(num, 0, -1):\n            print(f"{i}...")\n            time.sleep(1)\n        print("Blast off! 🚀")\n        break\n    except ValueError:\n        print("That\'s not a valid number. Please try again.")',
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
  const [isCallActive, setIsCallActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isCallActive) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: "Camera Access Denied",
            description:
              "Please enable camera permissions in your browser settings to use the video call feature.",
          });
        }
      };

      getCameraPermission();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setHasCameraPermission(null);
    }
  }, [isCallActive, toast]);

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

    let newOutput = output;
    if (currentStdin) {
      newOutput += `${currentStdin}\n`;
    } else {
      newOutput = "";
    }

    newOutput += "Compiling and running...\n";
    setOutput(newOutput);

    try {
      const result = await compileAndRunCode({
        code,
        language,
        stdin: currentStdin,
        conversation: output,
      });
      const resultOutput = result.output;

      setOutput((prev) =>
        prev.replace("Compiling and running...\n", "") + resultOutput
      );

      if (
        resultOutput.toLowerCase().includes("enter") ||
        resultOutput.toLowerCase().includes("input")
      ) {
        setIsWaitingForInput(true);
      } else {
        setIsWaitingForInput(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setOutput(
        (prev) =>
          prev.replace("Compiling and running...\n", `Error: ${errorMessage}\n`)
      );
      toast({
        title: "Execution Failed",
        description:
          "An error occurred while running your code. Please check the output panel.",
        variant: "destructive",
      });
      setIsWaitingForInput(false);
    } finally {
      setIsCompiling(false);
      setStdin("");
    }
  };

  const handleSubmitInput = () => {
    if (stdin.trim()) {
      setIsWaitingForInput(false);
      handleCompile(stdin);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInput();
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
    a.download = `codejutsu-code${fileExtensions[language]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: `Your code has been downloaded as codejutsu-code${fileExtensions[language]}.`,
    });
  };

  const handleVideoCallToggle = () => {
    setIsCallActive(!isCallActive);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share the link with your friends.",
    });
  }


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
        onVideoCallToggle={handleVideoCallToggle}
        isCallActive={isCallActive}
      />
      <main className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={isCallActive ? 75 : 100}>
            <div className="flex flex-col h-full gap-4 p-4">
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
            </div>
          </ResizablePanel>
          {isCallActive && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20}>
                <Card className="m-4 h-[calc(100%-2rem)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Video Call</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>Copy Link</Button>
                  </CardHeader>
                  <CardContent className="h-full pt-2">
                    <div className="flex flex-col gap-4 h-full">
                        <div className="w-full aspect-video rounded-md bg-muted overflow-hidden">
                           <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                        </div>
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                         <div className="text-xs text-muted-foreground text-center">
                            Note: Full video call functionality requires a backend implementation. This is a UI preview.
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
