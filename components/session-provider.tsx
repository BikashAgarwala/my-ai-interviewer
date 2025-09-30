"use client"

import { useEffect, useState } from "react"
import { useInterviewStore } from "@/store/interview-store"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false)
    const { activeInterview, resetActiveInterview } = useInterviewStore()
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (activeInterview.phase === "IN_PROGRESS") {
            setShowModal(true)
        }
    }, [])

    if (!isMounted) {
        return null;
    }

    const handleStartOver = () => {
        resetActiveInterview()
        setShowModal(false)
        window.location.reload();
    }

    return (
        <>
            <AlertDialog open={showModal} onOpenChange={setShowModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Welcome Back!</AlertDialogTitle>
                        <AlertDialogDescription>
                            It looks like you left an interview in progress. Would you like to continue where you left off or start over?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleStartOver}>Start Over</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setShowModal(false)}>Resume Interview</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {children}
        </>
    )
}