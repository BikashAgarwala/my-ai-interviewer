"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

const MODEL_NAME = "gemini-2.5-flash-lite"
const API_KEY = process.env.GEMINI_API_KEY!

const genAI = new GoogleGenerativeAI(API_KEY)

export async function generateQuestion(difficulty: "Easy" | "Medium" | "Hard", questionNumber: number) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an AI interviewer for a full-stack (React/Node.js) developer role. 
    Generate one ${difficulty} interview question. This is question number ${questionNumber} out of 6.
    Do not repeat questions. Make the question concise and clear.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("AI Error:", error)
    return `[Error] This is a placeholder for your ${difficulty} question #${questionNumber}. Please check the server logs.`
  }
}

export async function createSummary(fullTranscript: string) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an AI hiring assistant. Based on the following interview transcript, 
    provide a final score out of 100 and a concise 3-sentence summary of the candidate's performance, 
    highlighting their strengths and weaknesses.
    
    Transcript:
    ${fullTranscript}`

  const generationConfig = {
    temperature: 0.7,
  };
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    return result.response.text()
  } catch (error) {
    console.error("AI Error:", error)
    return "[Error] Could not generate a summary. Please check the server logs."
  }
}