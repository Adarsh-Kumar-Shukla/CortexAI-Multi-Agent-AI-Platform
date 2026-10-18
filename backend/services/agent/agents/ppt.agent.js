import { checkLimit } from "../config/agentlimit.js"
import { getModel } from "../config/llmModel.js"
import { deductCredits } from "../utils/deductCredits.js"
import { generatePpt } from "../utils/generatePpt.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"

export const pptAgent=async(state)=>{
  try {
    await checkLimit(state.userId, "ppt")
    const llm=await getModel("ppt")
    const prompt=`
    You are a professional presentation designer.

    Format:

    {
    "title":"",
    "subtitle":"",
    "slides":[
    {
      "title":"",
      "points:[
      "",
      "",
      "",
      ""
      ]
    }
    ]
    }
    Rules:
    - Generate exactly 6 content slides.
    - Each slide should have 4-6 detail bullet points.
    - No markdown.
    - No explanation.
    - No code block.
    - Return ONLY JSON.

    Topic:

    ${state.prompt}
    `
    const res=await llm.invoke(prompt)
    const data=JSON.parse(res.content)
    await deductCredits(state.userId, "ppt")
    const ppt=await generatePpt(data)
    const buffer=await ppt.write({
      outputType:"nodebuffer"
    })

    const filename=`ppt-${Date.now()}.pptx`

    await uploadToS3(filename, buffer, "application/vnd.openxmlformats-officedocument.presentationml.presentation")

    const downLoadUrl= await getFromS3(filename, 24*60*60)
    return {
      ...state,
      aiResponse:`# PPT Generated Successfully

**${data.title}**

Your PPT is ready to download.

[⬇️ Download PPT](${downLoadUrl})

_Link expires in 24 hours._`
    }
  } catch (error) {
    console.log(error)
    
    return {
      ...state,
      aiResponse:error?.data?.message || "Failed to generate PPT..."
    }
  }
}