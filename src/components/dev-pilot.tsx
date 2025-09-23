"use client";

import { useState, KeyboardEvent } from "react";
import { Sparkles, Loader2, Check, X, Clipboard, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { assistWithCode } from "@/ai/flows/assist-code";
import type { Language } from "./header";
import { CodeEditor } from "./code-editor";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface DevPilotProps {
  code: string;
  language: Language;
  onCodeUpdate: (newCode: string) => void;
  onLanguageChange: (newLanguage: Language) => void;
}

const languages: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

export function DevPilot({ code, language, onCodeUpdate, onLanguageChange }: DevPilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!request.trim()) {
      toast({
        title: "Request is empty",
        description: "Please describe what you want DevPilot to do.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedLanguage) {
        toast({
            title: "No language selected",
            description: "Please select a language to generate code for.",
            variant: "destructive",
        });
        return;
    }
    setIsGenerating(true);
    setGeneratedCode(null);
    try {
      const result = await assistWithCode({
        code: selectedLanguage === language ? code : `// Please generate code in ${selectedLanguage}`,
        language: selectedLanguage,
        request,
      });
      setGeneratedCode(result.code);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "DevPilot Failed",
        description:
          `An error occurred while generating code: ${errorMessage}`,
        variant: "destructive",
      });
      setGeneratedCode(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedCode && selectedLanguage) {
      if (selectedLanguage !== language) {
        onLanguageChange(selectedLanguage);
      }
      onCodeUpdate(generatedCode);
      toast({
        title: "Code Updated",
        description: "DevPilot's suggestions have been applied to the editor.",
      });
      resetAndClose();
    }
  };

  const handleDecline = () => {
    resetAndClose();
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setRequest("");
    setGeneratedCode(null);
    setIsGenerating(false);
    setSelectedLanguage(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetAndClose();
    } else {
      setIsOpen(true);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2" />
          DevPilot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] lg:max-w-[60vw] h-[80vh] flex flex-col">
        {!selectedLanguage && !generatedCode && (
            <>
                <DialogHeader>
                    <DialogTitle>Select a Language</DialogTitle>
                    <DialogDescription>
                        Which programming language do you want to generate code for?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {languages.map((lang) => (
                        <Card key={lang.value} className={cn("cursor-pointer hover:bg-muted/50 transition-all", selectedLanguage === lang.value && "border-primary ring-2 ring-primary")} onClick={() => setSelectedLanguage(lang.value)}>
                            <CardContent className="flex items-center justify-center p-6">
                                <h3 className="text-lg font-semibold">{lang.label}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </>
        )}
        {selectedLanguage && !generatedCode && (
          <>
            <DialogHeader>
              <DialogTitle>DevPilot for {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}</DialogTitle>
              <DialogDescription>
                Describe the changes you want to make. DevPilot will generate a new version for you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 flex-1">
              <Textarea
                placeholder="e.g., 'Refactor this code to be more efficient' or 'Add error handling for the input'"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="h-full resize-none"
                disabled={isGenerating}
                onKeyDown={handleKeyDown}
              />
            </div>
            <DialogFooter className="items-center">
               <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>Back to language selection</Button>
              <Button
                type="submit"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 animate-spin" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate Code"}
              </Button>
            </DialogFooter>
          </>
        )}
        {generatedCode && !isGenerating && (
          <>
            <DialogHeader>
              <DialogTitle>DevPilot Suggestions</DialogTitle>
              <DialogDescription>
                Review the code generated by DevPilot. Accept it to apply the changes to your editor.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Generated Code</h3>
                    <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                        {isCopied ? <ClipboardCheck className="mr-2"/> : <Clipboard className="mr-2"/>}
                        {isCopied ? "Copied" : "Copy"}
                    </Button>
                </div>
                <Separator />
                <div className="rounded-lg border overflow-hidden flex-1">
                  <CodeEditor 
                    language={selectedLanguage!}
                    theme="vs-dark"
                    value={generatedCode}
                    onChange={() => {}} // Readonly
                    options={{ readOnly: true }}
                  />
                </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={handleDecline}>
                <X className="mr-2" />
                Decline
              </Button>
              <Button onClick={handleAccept}>
                <Check className="mr-2" />
                Accept
              </Button>
            </DialogFooter>
          </>
        )}
         {isGenerating && generatedCode === null && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating suggestions...</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
