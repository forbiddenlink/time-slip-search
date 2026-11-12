'use client'

import { useState, useEffect } from 'react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
}

export function VoiceInput({ onTranscript, isDisabled = false }: Readonly<VoiceInputProps>) {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
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
        setHasError(false)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setHasError(true)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('MIC BLOCKED - ALLOW MICROPHONE IN BROWSER SETTINGS')
        } else if (event.error === 'audio-capture') {
          setErrorMessage('NO MICROPHONE FOUND')
        } else if (event.error === 'no-speech') {
          setErrorMessage('NO SPEECH HEARD - TRY AGAIN')
        } else {
          setErrorMessage('ERR: SIGNAL LOST')
        }
        // Clear error after 6 seconds so the message can be read
        setTimeout(() => {
          setHasError(false)
          setErrorMessage('')
        }, 6000)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)

      // Return cleanup that references the local instance, not state
      // (state would be stale/null due to closure timing)
      return () => {
        recognitionInstance.stop()
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setHasError(false)
      try {
        recognition.start()
        setIsListening(true)
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setHasError(true)
        setErrorMessage('ERR: START FAILED')
      }
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
      className={`ed-btn
        ${hasError || isListening ? '!border-edition !text-edition' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label={isListening ? 'Stop voice input' : hasError ? 'Microphone error' : 'Start voice input'}
      title={hasError ? errorMessage : isListening ? 'Listening... Click to stop' : 'Search by voice'}
    >
      <span className="flex items-center gap-2">
        {hasError ? (
          <>
                        <span role="alert" className="text-xs md:text-sm">{errorMessage}</span>
          </>
        ) : isListening ? (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-edition" />
            <span>Listening</span>
          </>
        ) : (
          <>
            <span>Voice</span>
          </>
        )}
      </span>
    </button>
  )
}
