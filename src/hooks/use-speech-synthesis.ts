"use client";

import { useState, useEffect, useCallback } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported || !text || !window.speechSynthesis) return;

    // If speaking, cancel to avoid overlap
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) {
        onEnd();
      }
    };
    
    utterance.onerror = (event) => {
      console.error("SpeechSynthesis Error", event);
      setIsSpeaking(false);
       if (onEnd) {
        onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
};
