
import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectorDB.js";
import { getModel } from "../config/llmModel.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";
import { checkLimit } from "../config/agentLimit.js";

export const pdfRag = async (state) => {
  try {
    await checkLimit(state.userId, "pdf")
    if (!state.file?.path) {
      throw new Error("PDF file is missing from graph state");
    }

    const buffer = await fs.readFile(state.file.path);
    const pdf = new PDFParse({ data: buffer });

    try {
      // IMPORTANT: await the asynchronous extraction
      const result = await pdf.getText();
      const text = result.text;

      if (typeof text !== "string" || !text.trim()) {
        throw new Error("No readable text found in the PDF");
      }

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([text]);
      const collectionName = `pdf-${Date.now()}`;

      const store = await vectorStore(docs, collectionName);
      const relevantDocs = await store.similaritySearch(
        state.prompt || "",
        5
      );

      const context = relevantDocs
        .map((doc) => doc.pageContent)
        .join("\n\n");

      const llm = await getModel("pdf-rag");

      const messages = [
        new SystemMessage(
          `You are CortexAI PDF Assistant.
          Answer only from the uploaded PDF.
          Never make up information.
          If the answer is absent, say:
          "I couldn't find this information in the uploaded PDF."
          Use Markdown formatting.`
        ),
        new HumanMessage(
          `Context:\n${context}\n\nQuestion:\n${state.prompt}`
        ),
      ];

      const response = await llm.invoke(messages);

      await deductCredits(state.userId, "pdf");

      return {
        ...state,
        aiResponse: response.content,
      };
    } finally {
      await pdf.destroy();
    }
  } catch (error) {
    console.error("PDF RAG error:", error);

    return {
      ...state,
      aiResponse: error?.data?.message || "Failed to analyze PDF.",
    };
  } finally {
    if (state.file?.path) {
      try {
        await fs.unlink(state.file.path);
      } catch (error) {
        console.error("PDF cleanup error:", error.message);
      }
    }
  }
};
