'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useToast from './useToast';

const COMMANDS = {
  // Navigation commands
  'go to dashboard': '/',
  'go to consignments': '/consignments',
  'go to invoices': '/invoices',
  'go to payments': '/payments',
  'go to parties': '/parties',
  'go to vehicles': '/vehicles',
  'go to masters': '/masters',
  'go to reports': '/reports',
  'go to settings': '/settings',
  'go home': '/',
  'open dashboard': '/',
  'open consignments': '/consignments',
  'open invoices': '/invoices',
  'open payments': '/payments',

  // Action commands
  'new consignment': '/consignments/new',
  'create consignment': '/consignments/new',
  'add consignment': '/consignments/new',
  'new invoice': '/invoices/new',
  'create invoice': '/invoices/new',
  'new payment': '/payments/new',
  'record payment': '/payments/new',
};

export default function useVoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          showInfo('Listening... Say a command');
        };

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const text = result[0].transcript.toLowerCase().trim();
          setTranscript(text);

          if (result.isFinal) {
            processCommand(text);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            showError(`Voice error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processCommand = useCallback((text) => {
    // Find matching command
    for (const [command, route] of Object.entries(COMMANDS)) {
      if (text.includes(command)) {
        showSuccess(`Executing: ${command}`);
        router.push(route);
        return;
      }
    }

    // Special commands
    if (text.includes('toggle dark') || text.includes('dark mode')) {
      document.documentElement.classList.toggle('dark');
      showSuccess('Theme toggled');
      return;
    }

    if (text.includes('scroll down')) {
      window.scrollBy({ top: 300, behavior: 'smooth' });
      return;
    }

    if (text.includes('scroll up')) {
      window.scrollBy({ top: -300, behavior: 'smooth' });
      return;
    }

    if (text.includes('go back')) {
      router.back();
      showSuccess('Going back');
      return;
    }

    if (text.includes('refresh') || text.includes('reload')) {
      window.location.reload();
      return;
    }

    showInfo(`Command not recognized: "${text}"`);
  }, [router, showSuccess, showInfo]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    commands: Object.keys(COMMANDS)
  };
}
