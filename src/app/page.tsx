"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { compileAndRunCode, CompileAndRunCodeOutput } from "@/ai/flows/compile-and-run-code";
import { Header, type Language, type Theme } from "@/components/header";
import { CodeEditor } from "@/components/code-editor";
import { DevPilot } from "@/components/dev-pilot";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toggle } from "@/components/ui/toggle";
import { database } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove } from "firebase/database";
import Image from "next/image";

const defaultCode: Record<Language, string> = {
  python: `import matplotlib.pyplot as plt
import numpy as np

# Data for the pie chart
labels = ['Frogs', 'Hogs', 'Dogs', 'Logs']
sizes = [15, 30, 45, 10]
explode = (0, 0.1, 0, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')

# Create a new figure and axes
fig1, ax1 = plt.subplots()

# Create the pie chart
ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
        shadow=True, startangle=90)
ax1.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.

# Display the plot
plt.show()`,
  java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}',
  cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "Enter your name: ";\n    std::getline(std::cin, name);\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    char name[50];\n    printf("Enter your name: ");\n    fgets(name, 50, stdin);\n    printf("Hello, %s", name);\n    return 0;\n}',
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("python");
  const [theme, setTheme] = useState<Theme>("vs-dark");
  const [code, setCode] = useState<string>(defaultCode.python);
  const [output, setOutput] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [stdin, setStdin] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const roomIdFromUrl = new URLSearchParams(window.location.search).get('roomId');
    if (roomIdFromUrl) {
      handleVideoCallToggle(roomIdFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      streamRef.current = null;
      peerConnectionRef.current = null;
      setHasCameraPermission(null);
      if (roomIdRef.current) {
        const roomRef = ref(database, 'rooms/' + roomIdRef.current);
        remove(roomRef);
        roomIdRef.current = null;
      }
       // Clean up URL
      if (window.history.pushState) {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newUrl},'',newUrl);
      }
    };

    if (!isCallActive) {
      cleanup();
    }
    
    return () => {
        cleanup();
    }
  }, [isCallActive]);

  const setupPeerConnection = (localStream: MediaStream, roomId: string) => {
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    const roomRef = ref(database, 'rooms/' + roomId);
    const signalingRef = ref(database, 'rooms/' + roomId + '/signaling');
    const iceCandidatesRef = ref(database, 'rooms/' + roomId + '/iceCandidates');


    pc.onicecandidate = (event) => {
        if (event.candidate) {
            const candidateRef = ref(database, `rooms/${roomId}/iceCandidates/${Date.now()}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };
    
    onValue(iceCandidatesRef, (snapshot) => {
        if (snapshot.exists()) {
            const candidates = snapshot.val();
            Object.values(candidates).forEach((candidate) => {
                if (candidate && pc.signalingState !== 'closed') {
                   try {
                     pc.addIceCandidate(new RTCIceCandidate(candidate as RTCIceCandidateInit));
                   } catch (e) {
                      console.error("Error adding received ICE candidate", e);
                   }
                }
            });
        }
    });

    onValue(signalingRef, async (snapshot) => {
        const data = snapshot.val();
        if (data && pc.signalingState !== 'closed') {
            if (data.type === 'offer' && pc.signalingState !== 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(data));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                set(signalingRef, { type: 'answer', sdp: pc.localDescription?.sdp });
            } else if (data && data.type === 'answer' && pc.signalingState !== 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(data));
            }
        }
    });

    peerConnectionRef.current = pc;

    return roomRef;
  };
  
  const handleToggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const handleToggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setOutput("");
    setImageUrl(null);
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
    setImageUrl(null);

    let conversation;
    let currentOutput;

    if (currentStdin) {
      currentOutput = `${output}\n${currentStdin}\n`;
      conversation = currentOutput;
    } else {
      currentOutput = "Compiling and running...\n";
      conversation = "";
    }
    setOutput(currentOutput);


    try {
      const result: CompileAndRunCodeOutput = await compileAndRunCode({
        code,
        language,
        stdin: currentStdin,
        conversation: conversation,
      });

      const resultOutput = result.output;
      
      let finalOutput;
      if (currentStdin) {
        finalOutput = currentOutput + resultOutput;
      } else {
        finalOutput = resultOutput;
      }
      setOutput(finalOutput.replace("Compiling and running...\n", ""));


      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
      }

      if (
        resultOutput.toLowerCase().includes("enter") ||
        resultOutput.toLowerCase().includes("input")
      ) {
        setIsWaitingForInput(true);
      } else {
        setIsWaitingForInput(false);
      }
    } catch (error) {
      console.error(error);
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
      handleCompile(stdin);
      setIsWaitingForInput(false);
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

  const handleVideoCallToggle = async (joinRoomId: string | null = null) => {
    if (isCallActive) {
      setIsCallActive(false);
      return;
    }
    
    setIsCallActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      
      const newRoomId = joinRoomId || Date.now().toString();
      roomIdRef.current = newRoomId;

      const roomRef = setupPeerConnection(stream, newRoomId);

      if (!joinRoomId) { // This user is creating the call
        await set(roomRef, { creator: true });
        onDisconnect(roomRef).remove();
        const pc = peerConnectionRef.current!;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const signalingOfferRef = ref(database, `rooms/${newRoomId}/signaling`);
        await set(signalingOfferRef, { type: 'offer', sdp: pc.localDescription?.sdp });
      }

      if (window.history.pushState) {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + newRoomId;
        window.history.pushState({path:newUrl},'',newUrl);
      }
      
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setHasCameraPermission(false);
      setIsCallActive(false);
      toast({
        variant: "destructive",
        title: "Media Access Denied",
        description: "Please enable camera and microphone permissions in your browser settings.",
      });
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share the link with your friend to join the call.",
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
      />
      <main className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={isCallActive ? 75 : 100}>
            <div className="flex flex-col h-full">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60}>
                  <div className="flex flex-col h-full gap-4 p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold px-1">Code Editor</h2>
                      <div className="flex items-center gap-2">
                         <Button onClick={() => handleVideoCallToggle()} variant="outline" size="sm" className="gap-2">
                           <Video />
                           Start Video Call
                         </Button>
                        <DevPilot
                          code={code}
                          language={language}
                          onCodeUpdate={setCode}
                          onLanguageChange={handleLanguageChange}
                        />
                      </div>
                    </div>
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
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40}>
                   <div className="flex flex-col h-full gap-2 p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold px-1">Output</h2>
                      </div>
                      <Separator />
                      <div className="flex flex-col flex-1 gap-2">
                        <ScrollArea className="flex-1 p-4 rounded-lg border bg-muted/20 shadow-inner">
                          <pre className="text-sm font-code whitespace-pre-wrap">
                            {output || "Output will be displayed here."}
                          </pre>
                          {imageUrl && (
                            <div className="mt-4">
                                <Image src={imageUrl} alt="Generated Plot" width={400} height={300} className="rounded-md" />
                            </div>
                          )}
                        </ScrollArea>
                        {isWaitingForInput && (
                          <div className="relative">
                            <Textarea
                              placeholder="Type your input here..."
                              className="w-full pr-28 font-code"
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
                </ResizablePanel>
              </ResizablePanelGroup>
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
                        <div className="relative w-full aspect-video rounded-md bg-muted overflow-hidden">
                           <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline/>
                           {!isCameraOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                                <VideoOff className="w-12 h-12 text-muted-foreground" />
                            </div>
                           )}
                        </div>
                        <div className="relative w-full aspect-video rounded-md bg-muted overflow-hidden">
                           <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline/>
                        </div>
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                        {hasCameraPermission && (
                             <div className="flex justify-center gap-2">
                                <Toggle pressed={isCameraOn} onPressedChange={handleToggleCamera} aria-label="Toggle camera" variant="outline">
                                    {isCameraOn ? <Video /> : <VideoOff />}
                                </Toggle>
                                <Toggle pressed={isMicOn} onPressedChange={handleToggleMic} aria-label="Toggle microphone" variant="outline">
                                    {isMicOn ? <Mic /> : <MicOff />}
                                </Toggle>
                                <Button onClick={() => setIsCallActive(false)} variant="destructive" size="icon">
                                  <PhoneOff />
                                </Button>
                            </div>
                        )}
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
