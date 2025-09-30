"use client"

import { useState, useMemo } from "react"
import { useInterviewStore } from "@/store/interview-store"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CandidatesTable } from "@/components/candidates-table"
import { Search, Users, TrendingUp, Clock } from "lucide-react"

export default function InterviewerDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const candidates = useInterviewStore((state) => state.candidates)

  const stats = useMemo(() => {
    const totalInterviews = candidates.length
    const completed = candidates.filter(c => c.status === 'completed')
    const averageScore = completed.length > 0
      ? completed.reduce((acc, c) => acc + c.finalScore, 0) / completed.length
      : 0
    const pendingReviews = candidates.filter(c => c.status !== 'completed').length

    return {
      totalInterviews,
      averageScore: averageScore.toFixed(1),
      pendingReviews
    }
  }, [candidates])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalInterviews}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.averageScore}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.pendingReviews}</div>
            </CardContent>
          </Card>
        </div>
        <CandidatesTable candidates={candidates} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
