"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, History } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type Language } from "./header";
import { formatDistanceToNow } from 'date-fns';

export type HistoryEntry = {
  name: string;
  code: string;
  language: Language;
  timestamp: string;
};

interface HistoryPanelProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onRestore, onClear }: HistoryPanelProps) {
  return (
    <Card className="h-full flex flex-col m-4 mr-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History />
          History
        </CardTitle>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash className="w-4 h-4" />
                <span className="sr-only">Clear History</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your entire code history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClear}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6 pt-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-12">
                <History className="w-16 h-16 mb-4"/>
                <p className="text-sm">Your code execution history will appear here.</p>
                <p className="text-xs mt-1">Run some code to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onRestore(entry)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm">{entry.name}</p>
                        <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                    <div className="flex justify-between items-end">
                        <pre className="text-sm font-code bg-transparent p-0 whitespace-pre-wrap truncate h-12 w-full">
                            {entry.code}
                        </pre>
                         <p className="text-xs font-semibold uppercase bg-primary/10 text-primary px-2 py-1 rounded-full flex-shrink-0">
                            {entry.language}
                        </p>
                    </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    