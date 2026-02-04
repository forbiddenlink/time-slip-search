'use client'

import { useState, useEffect } from 'react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
}

export function VoiceInput({ onTranscript, isDisabled = false }: Readonly<VoiceInputProps>) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onTranscript(transcript)
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isDisabled}
      className={`px-4 py-3 rounded border-2 transition-all led-text
        ${
          isListening
            ? 'bg-vhs-red/20 border-vhs-red text-vhs-red animate-pulse'
            : 'bg-crt-dark border-crt-light/40 text-aged-cream hover:border-phosphor-teal hover:shadow-glow-teal'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}
      `}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      title={isListening ? 'Listening... Click to stop' : 'Search by voice'}
    >
      <span className="flex items-center gap-2">
        {isListening ? (
          <>
            <span className="inline-block w-2 h-2 bg-vhs-red rounded-full animate-pulse" />
            <span className="text-sm">LISTENING...</span>
          </>
        ) : (
          <>
            <span className="text-lg">🎤</span>
            <span className="hidden md:inline text-sm">VOICE</span>
          </>
        )}
      </span>
    </button>
  )
}
