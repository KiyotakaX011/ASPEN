/* Simple voice manager for speech-to-text and text-to-speech */

export class VoiceManager {
  private recognition: any | null = null;
  private synthesis = window.speechSynthesis;
  private isListening = false;
  private onWakeWord: () => void;
  private onResult: (text: string) => void;

  constructor(onWakeWord: () => void, onResult: (text: string) => void) {
    this.onWakeWord = onWakeWord;
    this.onResult = onResult;
    
    // Check for standard or webkit SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.toLowerCase().trim();
        console.log("Speech detected:", text);
        
        if (text.includes("aspen")) {
          this.onWakeWord();
        } else {
          this.onResult(text);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
          }
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error("SpeechRecognition error:", event.error);
        if (event.error === 'not-allowed') {
          this.isListening = false;
        }
      };
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      try {
        this.recognition.start();
        console.log("Voice systems online.");
      } catch (e) {
        console.error("Failed to start voice systems:", e);
      }
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speak(text: string, onEnd?: () => void) {
    // Cancel previous speech to avoid overlapping
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.9; // Slightly lower pitch for a sophisticated vibe
    
    // Find a nice male/sophisticated voice if available
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Daniel'));
    if (preferredVoice) utterance.voice = preferredVoice;

    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    this.synthesis.speak(utterance);
  }
}
