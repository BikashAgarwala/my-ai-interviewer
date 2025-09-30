"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/components/chat-message"
import { CountdownTimer } from "@/components/countdown-timer"
import { Send } from "lucide-react"
import { ResumeUploader } from "@/components/resume-uploader"

import { useInterviewStore } from "@/store/interview-store"
import { generateQuestion, createSummary } from "@/app/actions"

export default function AIInterviewerPage() {
  const {
    activeInterview,
    startInterview,
    addMessage,
    setPhase,
    setQuestionNumber,
    completeActiveInterview,
    resetActiveInterview
  } = useInterviewStore()

  const { phase, messages, questionNumber } = activeInterview

  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeLimit, setTimeLimit] = useState(20)
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleStartInterview = (details: { name: string, email: string, phone: string }) => {
    startInterview(details)
    fetchNextQuestion(0)
  }

  const fetchNextQuestion = async (currentQNumber: number) => {
    const nextQuestionNumber = currentQNumber + 1
    if (nextQuestionNumber > 6) {
      handleInterviewCompletion()
      return
    }

    setIsLoading(true)
    let difficulty: "Easy" | "Medium" | "Hard" = "Easy"
    if (nextQuestionNumber > 2) difficulty = "Medium"
    if (nextQuestionNumber > 4) difficulty = "Hard"

    setTimeLimit(difficulty === "Easy" ? 20 : difficulty === "Medium" ? 60 : 120)

    const questionContent = await generateQuestion(difficulty, nextQuestionNumber)

    addMessage({ id: Date.now().toString(), content: questionContent, isAI: true, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
    setQuestionNumber(nextQuestionNumber)
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (isLoading) return

    addMessage({ id: Date.now().toString(), content: currentAnswer, isAI: false, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
    setCurrentAnswer("")
    await fetchNextQuestion(questionNumber)
  }

  const handleInterviewCompletion = async () => {
    setPhase("COMPLETED")
    addMessage({ id: "summary", content: "Thank you for completing the interview! Generating your summary...", isAI: true, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })

    setIsLoading(true)
    const transcript = messages.map(m => `${m.isAI ? 'AI' : 'Candidate'}: ${m.content}`).join('\n')
    const summaryText = await createSummary(transcript)
    setIsLoading(false)

    addMessage({ id: "final", content: summaryText, isAI: true, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })

    const scoreMatch = summaryText.match(/Score: (\d+)\/100/)
    const finalScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0
    const aiSummary = summaryText.split('Summary:')[1]?.trim() || summaryText

    completeActiveInterview({ finalScore, aiSummary })

    setTimeout(() => {
      resetActiveInterview()
    }, 15000)
  }

  const handleTimerComplete = () => {
    handleSubmit()
  }

  if (phase === "AWAITING_RESUME") {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center text-center p-4">
        <ResumeUploader onUploadSuccess={handleStartInterview} />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-border/20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-balance text-foreground">
              AI Interview: Question {questionNumber > 6 ? 6 : questionNumber} of 6
            </h1>
            <p className="text-sm text-muted-foreground mt-1">This is a timed interview for a Full Stack role.</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className="backdrop-blur-sm">
                <ChatMessage message={message.content} isAI={message.isAI} timestamp={message.timestamp} />
              </Card>
            ))}
            {isLoading && questionNumber > 0 && (
              <Card className="backdrop-blur-sm">
                <ChatMessage message="Thinking..." isAI={true} timestamp="" />
              </Card>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex-shrink-0 p-6 border-t border-border/20">
          {phase === "IN_PROGRESS" ? (
            <Card className="backdrop-blur-sm">
              <div className="p-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                      className="min-h-[80px] resize-none bg-input/50 backdrop-blur-sm"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground invisible">Character count</span>
                      <Button onClick={handleSubmit} disabled={!currentAnswer.trim() || isLoading} size="sm" className="gap-2">
                        {isLoading ? "Please wait..." : <><Send className="w-4 h-4" /> Submit Answer</>}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CountdownTimer
                      initialSeconds={timeLimit}
                      onComplete={handleTimerComplete}
                      key={`${questionNumber}-${timeLimit}`}
                    />
                    <span className="text-xs text-muted-foreground text-center">Time remaining</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-center backdrop-blur-sm">
              <p className="font-semibold">{isLoading ? "Generating Final Summary..." : "Interview Completed"}</p>
              <p className="text-sm text-muted-foreground">Your results are now available on the interviewer dashboard.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}