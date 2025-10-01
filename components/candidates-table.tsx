"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { CandidateDetailsModal } from "./candidate-details-modal"
import { Candidate } from "@/store/interview-store"
import ReactMarkdown from "react-markdown"

interface CandidatesTableProps {
  candidates: Candidate[]
  searchQuery: string
}

type SortField = "name" | "finalScore" | "interviewDate"
type SortDirection = "asc" | "desc"

interface CandidatesTableProps {
  searchQuery: string
}

export function CandidatesTable({ candidates, searchQuery }: CandidatesTableProps) {
  const [sortField, setSortField] = useState<SortField>("finalScore")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleRowClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-foreground" />
    ) : (
      <ChevronDown className="w-4 h-4 text-foreground" />
    )
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 80) return "secondary"
    return "outline"
  }

  const filteredAndSortedCandidates = candidates
    .filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "finalScore":
          aValue = a.finalScore
          bValue = b.finalScore
          break
        case "interviewDate":
          aValue = a.interviewDate
          bValue = b.interviewDate
          break
        default:
          return 0
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  return (
    <>
      <Card className="border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/30">
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Candidate Name
                    {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("finalScore")}
                >
                  <div className="flex items-center gap-2">
                    Final Score
                    {getSortIcon("finalScore")}
                  </div>
                </TableHead>
                <TableHead className="min-w-[300px]">AI Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCandidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(candidate)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground">{candidate.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(candidate.interviewDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(candidate.finalScore)} className="font-mono">
                      {candidate.finalScore}/100
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[400px]">
                    <p className="text-pretty leading-relaxed">
                      <ReactMarkdown>{candidate.aiSummary}</ReactMarkdown>
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedCandidates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No candidates found matching your search.</p>
          </div>
        )}
      </Card>

      <CandidateDetailsModal candidate={selectedCandidate} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
