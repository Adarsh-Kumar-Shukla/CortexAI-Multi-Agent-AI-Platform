import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import dotenv from "dotenv"

dotenv.config()

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey:process.env.GROQ_API_KEY
})


const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    temperature: 0,
    maxRetries: 2,
    // other params...
})

export const getModel=async(agent)=>{
  switch(agent){
    case "coding":
      return gemini;
    default:
      return groq;
  }
}