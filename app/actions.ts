"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

const MODEL_NAME = "gemini-2.5-flash-lite"
const API_KEY = process.env.GEMINI_API_KEY!

const genAI = new GoogleGenerativeAI(API_KEY)

export async function generateQuestion(difficulty: "Easy" | "Medium" | "Hard", questionNumber: number) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an engaging and insightful AI interviewer. Your persona is that of a helpful senior engineer who wants to see the candidate succeed.

  Your task is to generate one ${difficulty} interview question for a full-stack (React/Node.js) role. This is question number ${questionNumber} out of 6. Do not repeat questions you have asked before.

  **Ask the question clearly.** Frame it as a practical, real-world scenario when appropriate for the difficulty level.`

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

  const prompt = `You are an AI hiring assistant. Your task is to provide a final score and a concise summary based on the provided interview transcript. Follow these rules carefully:

    **Scoring Rules:**
    1.  The total score is out of 100, based on the 6 questions in the transcript.
    2.  Evaluate each answer for its technical accuracy, clarity, and depth.
    3.  **Crucially, if a candidate's answer for any question is missing, left blank, or is a clear refusal to answer (e.g., "pass", "I don't know"), you MUST assign 0 points for that specific question.**
    4.  The final score must reflect this penalty. A perfect score of 100 is impossible if any question is unanswered, even if all other answers are perfect.

    **Output Format:**
    The response MUST be in the following format:
    Score: [score]/100
    Summary: [A concise 3-sentence summary of the candidate's performance, highlighting strengths and weaknesses.]

    **Transcript:**
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