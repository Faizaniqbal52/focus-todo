import { useState } from 'react';

export default function useVoice(onResult) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (listening && window._recognitionInstance) {
      window._recognitionInstance.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    window._recognitionInstance = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = '';

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
        else interim += transcript;
      }
      onResult && onResult((finalTranscript + interim).trim());
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => { setListening(false); window._recognitionInstance = null; };
    recognition.start();
  };

  return { listening, startListening };
}
