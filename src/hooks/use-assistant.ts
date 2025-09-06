"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { convertVoiceToText } from "@/ai/flows/convert-voice-to-text";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";
import { getRandomJoke } from "@/lib/jokes";
import type { Note } from "@/components/notes-client";

export type ConversationEntry = {
  role: "user" | "assistant";
  content: string;
};

export type Status = "idle" | "listening" | "processing" | "speaking";
type NoteTakingState = "idle" | "waiting_for_content";

export const useAssistant = () => {
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [noteTakingState, setNoteTakingState] =
    useState<NoteTakingState>("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const router = useRouter();
  const { speak } = useSpeechSynthesis();

  const addConversationEntry = (role: "user" | "assistant", content: string) => {
    setConversation((prev) => [...prev, { role, content }]);
  };

  const assistantResponse = useCallback((text: string) => {
    if (!text) return;
    addConversationEntry("assistant", text);
    setStatus("speaking");
    speak(text, () => setStatus("idle"));
  }, [speak]);

  const processCommand = useCallback(async (command: string) => {
    const lowerCaseCommand = command.toLowerCase().trim();

    if (noteTakingState === "waiting_for_content") {
      try {
        const savedNotes = localStorage.getItem("cognito-notes");
        const notes: Note[] = savedNotes ? JSON.parse(savedNotes) : [];
        const newNote: Note = {
          id: Date.now().toString(),
          content: command,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("cognito-notes", JSON.stringify([newNote, ...notes]));
      } catch (e) {
        console.error("Failed to save note to local storage", e);
      }
      setNoteTakingState("idle");
      assistantResponse("Got it. I've saved your note.");
      return;
    }

    if (lowerCaseCommand.includes("what time is it") || lowerCaseCommand.includes("what's the time")) {
      const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      assistantResponse(`The current time is ${time}.`);
    } else if (lowerCaseCommand.includes("what is the date") || lowerCaseCommand.includes("what's today's date")) {
      const date = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      assistantResponse(`Today is ${date}.`);
    } else if (lowerCaseCommand.includes("tell me a joke")) {
      const joke = getRandomJoke();
      assistantResponse(joke);
    } else if (lowerCaseCommand.startsWith("open ")) {
      const target = lowerCaseCommand.replace("open ", "").trim();
      if (target === "notes") {
        router.push("/notes");
        assistantResponse("Opening your notes.");
      } else if (["google", "youtube", "gmail"].includes(target)) {
        window.open(`https://${target}.com`, "_blank");
        assistantResponse(`Opening ${target}.`);
      } else {
        assistantResponse(`Sorry, I can't open "${target}".`);
      }
    } else if (lowerCaseCommand.startsWith("take a note") || lowerCaseCommand.startsWith("create a note")) {
      setNoteTakingState("waiting_for_content");
      assistantResponse("Okay, what should I write down?");
    } else if (lowerCaseCommand.includes("read my notes")) {
       try {
        const savedNotes = localStorage.getItem("cognito-notes");
        const notes: Note[] = savedNotes ? JSON.parse(savedNotes) : [];
        if (notes.length === 0) {
          assistantResponse("You don't have any notes.");
        } else {
          router.push("/notes");
          const notesToRead = notes.slice(0, 3).map((n) => n.content).join(". ... ");
          assistantResponse(`Here are your latest notes... ${notesToRead}`);
        }
       } catch (e) {
         console.error("Failed to read notes from local storage", e);
         assistantResponse("I had trouble reading your notes.");
       }
    } else {
      try {
        const { answer } = await answerComplexQuery({ query: command });
        assistantResponse(answer);
      } catch (error) {
        console.error("Error answering complex query:", error);
        assistantResponse("I'm sorry, I'm having trouble finding an answer for that.");
      }
    }
  }, [noteTakingState, assistantResponse, router]);


  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startListening = useCallback(async () => {
    if (status === 'listening') return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setStatus("processing");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const { text } = await convertVoiceToText({ audioDataUri: base64Audio });
            if (text && text.trim()) {
              addConversationEntry("user", text);
              await processCommand(text);
            } else {
              assistantResponse("Sorry, I didn't catch that. Could you please repeat?");
            }
          } catch (error) {
            console.error("Error converting voice to text:", error);
            assistantResponse("I'm having trouble understanding right now.");
          }
        };
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setStatus("listening");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      assistantResponse("I can't access your microphone. Please check your browser permissions.");
    }
  }, [status, assistantResponse, processCommand]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return {
    conversation,
    status,
    startListening,
    stopListening,
  };
};
