# Voiceify - Easy Text To Voice And Vice Versa

__Find A Bug__

Issues: https://github.com/jamcha123/voiceify/issues

__Introuction__

Voiceify is a easy to implement AI agent that makes it easier to use OpenAIs realtime, STT and TTS API.

Voiceify makes text to voice easy.

__List Of Voiceify Functions__

1. realtimePrompt - a websocket realtime OpenAI chat prompter where you can chat with openai in realtime

2. TextToSpeech - enter a prompt in the config dictionary and pick a type e.g wav, aac, flac, mp3, opus, pcm then text turns into the audio file.

3. SpeechToText - enter a audio file e.g .aac, .flac, .mp3, .wav, .opus, .pcm file type then it will extract the text from the audio


__Initialization Of VoiceIfy__

Install Voiceify

    npm i voiceify 

Import the Voiceify 

    import Voiceify from 'voiceify'

Initialize Voiceify

    const obj = new Voiceify({"openai_key": "<enter your openai key to use it>})

Realtime Prompting: 

    await obj.realtimePrompt("enter your starting prompt") //then you can wait and for an response and enter a new prompt in realtime

TextToSpeech Config Options: 

    const TextToSpeechConfig = {"file_type": {"aac": "write a prompt for aac file", "flac": "write a prompt for flac file", "mp3": "write a prompt for mp3 file", "wav": "write a prompt for wav file", "opus": "write a prompt for opus file","pcm": "write a prompt for pcm file"}}

TextToSpeech:

    const speech = await obj.TextToSpeech(TextToSpeechConfig)
    console.log(speech)

SpeechToText: 

    const text = await obj.SpeechToText("<audio file name>") #the audio file has to be in your current directory





