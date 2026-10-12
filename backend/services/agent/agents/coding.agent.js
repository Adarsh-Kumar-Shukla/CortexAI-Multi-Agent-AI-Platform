import { getModel } from "../config/llmModel.js"

export const coding=async(state)=>{
  const intentLlm=await getModel("intent")
  const llm=await getModel("coding")
  const intentResponse=await intentLlm.invoke(`
    You are an intent classifier. Return ONLY one of these values.
    CODE_GENERATION
    CODE_REVIEW
    CODE_EXPLANATION
    DEBUGGING
    OPTIMIZATION
    CONVERSION
    DOCUMENTATION
    User Request:${state.prompt}
  `)
  const intent=intentResponse.content
  if(intent=="CODE_GENERATION"){
    const prompt=`
    You are CortextAI Coding Agent.
    Generate the requested project.
    Default stack:
    - HTML
    - CSS
    - JavaScript

    Use React/ Next.js/ Vue ONLY if explicitly requected.
    Rules: 
    - Responsive
    - Modern UI
    - CSS Variables
    - Flexbox/Grid
    - Smooth Scroll
    - Hover Effects
    - Beutiful spacing
    - Single page unless user aks otherwise.

    Return ONLY valid JSON.

    Schema:
    {
      "files":[
      {
        "files":"index.html,
        "content":"..."
      },
      {
        "files":"style.css,
        "content":"..."
      },
      {
        "files":"script.js,
        "content":"..."
      }
      ]
    }
      Rules:
      - Outputs must start with {
      - Output must end with }
      - No markdown
      - No extra text
      - No \`\`\`
      - Never mention intent

      User Request: ${state.prompt}
    `
    const res=await llm.invoke(prompt)
    const data=JSON.parse(res.content)
    return {
      ...state,
      aiResponse:"Code generated successfully.",
      artifacts:[
        {
          id:Date.now(),
          type:"Project",
          files:data.files || []
        }
      ]
    }
  }
  const res=await llm.invoke(`The user's request is ${intent} 
    Return Markdown only.
    Never generate project files.
    Use headlings like:
    # Overfiew
    ## Explaination
    ## Problems 
    ## Improvements
    ## Best Practices
    ## Optimized Code (if needed)
    User Reques: ${state.prompt}`)
    const data= res.content
    return {
      ...state,
      aiResponse:data,
      artifacts:[]
    }
}