"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Calendar } from "lucide-react"

interface CandidateDetails {
  id: string
  name: string
  email: string
  phone: string
  finalScore: number
  aiSummary: string
  interviewDate: string
  questions: Array<{
    question: string
    answer: string
  }>
}

interface CandidateDetailsModalProps {
  candidate: CandidateDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidateDetailsModal({ candidate, open, onOpenChange }: CandidateDetailsModalProps) {
  if (!candidate) return null

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 80) return "secondary"
    return "outline"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-balance">{candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{candidate.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{candidate.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interview Summary</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(candidate.interviewDate).toLocaleDateString()}
                </div>
                <Badge variant={getScoreBadgeVariant(candidate.finalScore)} className="font-mono">
                  {candidate.finalScore}/100
                </Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm leading-relaxed text-pretty">{candidate.aiSummary}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Interview Questions & Answers</h3>
            <div className="space-y-6">
              {candidate.questions.map((qa, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">Q{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-semibold text-foreground leading-relaxed">{qa.question}</p>
                      </div>
                      <div className="pl-4 border-l-2 border-muted">
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{qa.answer}</p>
                      </div>
                    </div>
                  </div>
                  {index < candidate.questions.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
