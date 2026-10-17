import { getModel } from "../config/llmModel.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";

export const visionAgent = async (state) => {
  try {
    const llm = await getModel("image");
    const res = await llm.invoke(`
    You are an elite AI image prompt engineer.
    Convert the user request into a highly detailed image generation prompt.
    Requirements:

    - Cinematic lighting
    - Professsional composition
    - High detail
    - Beautiful color palette
    - Sharp focus
    - BK quality
    - Photorealistic
    - 8K quality
    - Depth of field
    - Professional photography
    - Stunning visuals

    Return only the image prompt.
    User Request:${state.prompt}
    `);
    const prompt = res.content.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    await deductCredits(state.userId, "vision")
    const buffer = Buffer.from(imageRes.data);
    const fileName = `image-${Date.now()}.png`;
    await uploadToS3(fileName, buffer, "image/png");
    const downloadUrl = await getFromS3(fileName, 24 * 60 * 60);
    return {
  ...state,
  aiResponse: `# Image Generated Successfully

![Generated Image](${downloadUrl})

[⬇️ Download Image](${downloadUrl})

*Link expires in 24 hours.*`,
};
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: `Failed to generate image.`,
    };
  }
};
