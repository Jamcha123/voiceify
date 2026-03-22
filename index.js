import { RealtimeSession, RealtimeAgent } from '@openai/agents/realtime'
import {WebSocket} from 'ws'
import {OpenAI} from 'openai'
import fs from 'fs'
import {createInterface} from 'node:readline'
import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import {Server} from 'socket.io'
import { text } from 'node:stream/consumers'

const cli_reader = createInterface({
  input: process.stdin,
  output: process.stdout
})

export default class Voiceify{
  constructor(config = {"openai_key": ""}){
    this.apikey = config.openai_key
  }
  
  async realtimePrompt(prompting){
    const ai = new OpenAI({apiKey: this.apikey})
    const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime"
    const ws = new WebSocket(url, {
        headers: {
            authorization: "Bearer " + this.apikey 
        }
    })

    const event = {
      type: "session.update",
      session: {
          type: "realtime",
          model: "gpt-realtime",
          // Lock the output to audio (set to ["text"] if you want text without audio)
          output_modalities: ["audio"],
          audio: {
            input: {
              format: {
                type: "audio/pcm",
                rate: 24000,
              },
              turn_detection: {
                type: "semantic_vad"
              }
            },
            output: {
              format: {
                type: "audio/pcm",
              },
              voice: "marin",
            }
          },
          prompt: {
            id: "pmpt_123",          // your stored prompt ID
            version: "89",           // optional: pin a specific version
            variables: {
              city: "Paris"          // example variable used by your prompt
            }
          },
          instructions: "Speak clearly and briefly. Confirm understanding before taking actions."
      },
    };

    ws.on("open", function open() {
      console.log("Connected to server.");
    
      ws.send(
        JSON.stringify(event)
      )
    
      ws.send(
        JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: prompting,
                }
              ]
            }
        })
      )

      ws.send(JSON.stringify({
        type: "response.create",
        response: {
          output_modalities: [ "text" ]
        },
      }))
    });

    ws.on("message", async function incoming(message){ 
      if(JSON.parse(message)["type"] == "response.done"){
        const text = (JSON.parse(message)["response"]["output"][0]["content"][0]["text"])
        console.log(text)

        let active = false
        while(active === false){
          const cli_prompt = new Promise((resolve) => {
            cli_reader.question("\nRespone To The Output or press q to quit: \n\n", (answer) => {
              resolve(answer)
            })
          })
          const new_text = await cli_prompt
          if(text == "q"){
            active = true
            break
          }
          ws.send(
            JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "message",
                    role: "user",
                    content: [
                      {
                        type: "input_text",
                        text: new_text,
                      }
                    ]
                  }
            })
          )
          ws.send(JSON.stringify({
            type: "response.create", 
            response: {
              output_modalities: [ "text" ]
            }
          }))
        }
      }
    });
  }
  async TextToSpeech(config = {"file_type": {"aac": "", "flac": "", "mp3": "", "wav": "", "opus": "", "pcm": ""}}){
    const ai = new OpenAI({apiKey: this.apikey})

    const items = async (texts, file_type) => {
      const response = await ai.audio.speech.create({
        model: "gpt-4o-mini-tts", 
        voice: "alloy", 
        input: texts,
        instruction: "Speech like a professor giving a lecture",
        response_format: file_type
      })

      fs.createWriteStream("audio." + file_type).write(Buffer.from((await response.arrayBuffer())))
      return "audio." + file_type + ", created here: " + await process.cwd()
    }
    
    const arr = []
    if(typeof(config.file_type.aac) != undefined){
      items(config.file_type.aac, "aac").then((value) => {
        console.log(value)
      }).catch((err) => {

      })
    }
    
    if(typeof(config.file_type.flac) != undefined){
      items(config.file_type.flac, "flac").then((value) => {
        console.log(value)
      }).catch((err) => {

      })
    }

    if(typeof(config.file_type.mp3) != undefined){
      items(config.file_type.mp3, "mp3").then((value) => {
        console.log(value)
      }).catch((err) => {

      })
    }

    if(typeof(config.file_type.opus) != undefined){
      items(config.file_type.opus, "opus").then((value) => {
        console.log(value)
      }).catch((err) => {
      })
    }

    if(typeof(config.file_type.pcm) != undefined){
      items(config.file_type.flac, "pcm").then((value) => {
        console.log(value)
      }).catch((err) => {
      })
    }

    if(typeof(config.file_type.wav) == "string"){
      console.log("hello")
      items(config.file_type.wav, "wav").then((value) => {
        console.log(value)
      }).catch((err) => {
        console.log("error")
      })
    }

    return arr

  }
  async SpeechToText(video_file_path){
    const files = await process.cwd()
    const paths = await fs.readdirSync(files)

    let active = false

    for(let i = 0; i != paths.length; i++){
      if(paths[i] == video_file_path){
        active = true
      }
    }

    if(active === false){
      return video_file_path + " not in your folder of " + files
    }

    const ai = new OpenAI({apiKey: this.apikey})

    const response = await ai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file: fs.createReadStream(video_file_path)
    })

    return response.text
  }
}