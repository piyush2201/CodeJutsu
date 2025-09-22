"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
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

interface AiAssistProps {
  code: string;
  language: Language;
  onCodeUpdate: (newCode: string) => void;
}

export function AiAssist({ code, language, onCodeUpdate }: AiAssistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!request.trim()) {
      toast({
        title: "Request is empty",
        description: "Please describe what you want the AI to do.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await assistWithCode({
        code,
        language,
        request,
      });
      onCodeUpdate(result.code);
      toast({
        title: "AI finished generating",
        description: "Your code has been updated with the AI's suggestions.",
      });
      setIsOpen(false);
      setRequest("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "AI Assistant Failed",
        description:
          `An error occurred while generating code: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2" />
          Ask AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Code Assistant</DialogTitle>
          <DialogDescription>
            Describe the changes you want to make to your code. The AI will
            generate a new version for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="e.g., 'Refactor this code to be more efficient' or 'Add error handling for the input'"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={4}
            disabled={isGenerating}
          />
        </div>
        <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}
