import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type InterviewPhase = "AWAITING_RESUME" | "COLLECTING_INFO" | "IN_PROGRESS" | "COMPLETED"

interface Message {
  id: string
  content: string
  isAI: boolean
  timestamp: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  finalScore: number
  aiSummary: string
  status: "completed" | "in-progress"
  interviewDate: string
  questions: Array<{ question: string; answer: string }>
}

interface InterviewState {
  activeInterview: {
    phase: InterviewPhase
    messages: Message[]
    questionNumber: number
    candidateDetails: { name: string, email: string, phone: string }
  }
  candidates: Candidate[]
}

interface InterviewActions {
  startInterview: (details: { name: string, email: string, phone: string }) => void
  addMessage: (message: Message) => void
  setPhase: (phase: InterviewPhase) => void
  setQuestionNumber: (num: number) => void
  completeActiveInterview: (data: { finalScore: number, aiSummary: string }) => void
  resetActiveInterview: () => void
  updateLastMessage: (content: string) => void
}

const initialActiveState = {
  phase: "AWAITING_RESUME" as InterviewPhase,
  messages: [],
  questionNumber: 0,
  candidateDetails: { name: "", email: "", phone: "" },
};

export const useInterviewStore = create<InterviewState & InterviewActions>()(
  persist(
    (set, get) => ({
      activeInterview: initialActiveState,
      candidates: [],

      startInterview: (details) => set(state => ({
        activeInterview: {
          ...state.activeInterview,
          phase: "IN_PROGRESS",
          candidateDetails: details,
          messages: [
            {
              id: "intro",
              content: "Hello! Your resume has been processed. I'll be asking you 6 questions for this full-stack role. Let's begin.",
              isAI: true,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]
        }
      })),

      addMessage: (message) => set(state => ({
        activeInterview: { ...state.activeInterview, messages: [...state.activeInterview.messages, message] }
      })),

      setPhase: (phase) => set(state => ({ activeInterview: { ...state.activeInterview, phase } })),

      setQuestionNumber: (num) => set(state => ({ activeInterview: { ...state.activeInterview, questionNumber: num } })),

      completeActiveInterview: (data) => {
        const { activeInterview } = get();

        const questionsAndAnswers: Array<{ question: string; answer: string }> = [];
        for (let i = 1; i < activeInterview.messages.length; i++) {
          if (activeInterview.messages[i].isAI) {
            const answerMessage = activeInterview.messages.slice(i).find(m => !m.isAI);
            if (answerMessage) {
              questionsAndAnswers.push({
                question: activeInterview.messages[i].content,
                answer: answerMessage.content,
              });
            }
          }
        }

        const newCandidate: Candidate = {
          id: new Date().toISOString(),
          ...activeInterview.candidateDetails,
          ...data,
          status: 'completed',
          interviewDate: new Date().toISOString(),
          questions: questionsAndAnswers,
        };

        set(state => ({ candidates: [...state.candidates, newCandidate] }));
      },

      resetActiveInterview: () => set({ activeInterview: initialActiveState }),

      updateLastMessage: (content) => set((state) => {
        const messages = [...state.activeInterview.messages];
        if (messages.length > 0) {
          messages[messages.length - 1].content += content;
        }
        return {
          activeInterview: { ...state.activeInterview, messages }
        };
      }),
    }),
    {
      name: 'interview-session-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)