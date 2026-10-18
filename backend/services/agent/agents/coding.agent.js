import { checkLimit } from "../config/agentlimit.js";
import { getModel } from "../config/llmModel.js";
import { deductCredits } from "../utils/deductCredits.js";

export const coding = async (state) => {
  try {
    await checkLimit(state.userId, "coding")
    const intentLlm = await getModel("intent");
    const llm = await getModel("coding");

    const intentResponse = await intentLlm.invoke(`
Classify the user's request.
Return exactly one label:
CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User request: ${state.prompt}
`);

    const intent = String(intentResponse.content)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z_]/g, "");

    console.log("Detected coding intent:", intent);

    if (intent === "CODE_GENERATION") {
      const prompt = `
You are CortextAI Coding Agent.

Generate the requested project.
Default stack: HTML, CSS, and JavaScript.
Use React, Next.js, or Vue only if explicitly requested.
Make the project responsive, modern, and functional.

For IMAGES:
- Always use real Unsplash images.
- Never use placeholder.

Return ONLY valid JSON in this exact structure:
{
  "files": [
    {"name": "index.html", "content": "..."},
    {"name": "style.css", "content": "..."},
    {"name": "script.js", "content": "..."}
  ]
}

Requirements:
- Every file must have a name and content.
- Escape special characters correctly for JSON.
- Do not use Markdown fences.
- Do not include explanations outside the JSON.
- Generate the files needed for the user's request.



User request: ${state.prompt}
`;

      const response = await llm.invoke(prompt);
      const raw = String(response.content ?? "").trim();

      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");

      let data;

      try {
        data = JSON.parse(cleaned);
      } catch (error) {
        console.error("Project JSON parsing failed:", error.message);
        throw new Error("Coding model returned invalid JSON.");
      }

      if (!Array.isArray(data.files) || data.files.length === 0) {
        throw new Error("Coding model returned no project files.");
      }

      const files = data.files.map((file) => ({
        name: file.name,
        content: file.content,
      }));

      if (
        files.some(
          (file) =>
            typeof file.name !== "string" || typeof file.content !== "string",
        )
      ) {
        throw new Error("Generated files have an invalid structure.");
      }

      const artifacts = [
        {
          id: Date.now(),
          type: "Project",
          title: state.prompt,
          files,
        },
      ];

      console.log("Generated artifacts:", JSON.stringify(artifacts));
      await deductCredits(state.userId, "coding")
      return {
        ...state,
        aiResponse: "Code generated successfully.",
        artifacts,
      };
    }

    const response = await llm.invoke(`
You are CortextAI Coding Agent.

The user's request is classified as: ${intent}.

Return Markdown only.
Do not generate project files.
Use appropriate headings for the explanation, problems, improvements,
best practices, and optimized code when relevant.

User request: ${state.prompt}
`);
      await deductCredits(state.userId, "coding")
    return {
      ...state,
      aiResponse: String(response.content ?? ""),
      artifacts: [],
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: error?.data?.message || `Sorry, failed to generate code.`,
      artifacts: [],
    };
  }
};
