"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const playSuccessChime = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
  oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.1); 

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
};

export function WebVersionLink() {
  return (
    <Link 
      href="/login" 
      onClick={() => playSuccessChime()}
      className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
    >
      O usá la versión web <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
