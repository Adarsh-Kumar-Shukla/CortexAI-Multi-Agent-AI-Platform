import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

console.log("GROQ_API_KEY loaded:", !!process.env.GROQ_API_KEY);

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
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