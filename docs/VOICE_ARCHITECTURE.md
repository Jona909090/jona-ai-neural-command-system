# JONA AI voice architecture

Voice mode is local-only in the current phase:

- `MicrophoneController` requests browser permission, creates a temporary `MediaStream`, and sends realtime RMS/peak levels to the neural UI.
- `SpeechToTextService` uses browser `SpeechRecognition` when the browser provides it. Audio is not uploaded by JONA.
- `TextToSpeechService` uses browser `speechSynthesis`. Its visual amplitude envelope is an approximation because browser speech synthesis does not expose raw output samples.
- `VoiceContext` owns the voice lifecycle and reuses the existing JONA states rather than creating a competing AI state machine.

## Future server adapters

A server speech-to-text adapter should implement the `start`, `stop`, and `cancel` contract in `src/services/voice/SpeechToTextService.js`. Uploading microphone audio must not be added without explicit approval and a documented privacy policy.

A higher-quality speech provider should replace the adapter in `src/services/voice/TextToSpeechService.js`. Any provider secret must remain in a server-side environment variable; the browser may call only a secure application endpoint.

## Resource cleanup

Stopping or cancelling listening cancels the animation frame, stops every media track, closes the temporary `AudioContext`, and clears analyser references. Component unmount also cancels STT, microphone analysis, and speech synthesis.
