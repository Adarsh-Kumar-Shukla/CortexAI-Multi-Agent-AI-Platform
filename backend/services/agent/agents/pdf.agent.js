import { getModel } from "../config/llmModel.js"
import { generatePdf } from "../utils/generatePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"

export const pdfAgent=async(state)=>{
  try {
    const llm=await getModel("pdf")
    const prompt=`
    You are an expert document writer.
    Return ONLY valid JOSN.
    Do NOT return markdown.
    Do NOT return explainations.
    Structure: 
    {
      "title":"",
      "subtitle:"",
      "sections":[
      {
      "heading":"",
      "points":[]
      }
      ],
    }
    Generate 4-8 sections.
    Each sections should have 3-6 detail bullet points.
    Topic: ${state.prompt}
    `
    const res=await llm.invoke(prompt)
    const data=JSON.parse(res.content)
    const pdfBuffer=await generatePdf(data)
    const filename=`pdf-${Date.now()}.pdf`
    await uploadToS3(filename, pdfBuffer, "application/adf")
    const downLoadUrl=await getFromS3(filename, 24*60*60)

    return {
  ...state,
  aiResponse: `# PDF Generated Successfully

**${data.title}**

Your PDF is ready to download.

[⬇️ Download PDF](${downLoadUrl})

_Link expires in 24 hours._`,
};

  } catch (error) {
    console.log(error)
    return {
      ...state,
      aiResponse:"Failed to generate PDF."
    }
  }
}