"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, ArrowRight } from "lucide-react"

import * as pdfjs from 'pdfjs-dist'
import mammoth from "mammoth"
import { toast } from "sonner"
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface CandidateDetails {
    name: string
    email: string
    phone: string
}
type UploaderPhase = "UPLOADING" | "COLLECTING_INFO"

export function ResumeUploader({ onUploadSuccess }: { onUploadSuccess: (details: CandidateDetails) => void }) {

    const [phase, setPhase] = useState<UploaderPhase>("UPLOADING")
    const [file, setFile] = useState<File | null>(null)
    const [isParsing, setIsParsing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [details, setDetails] = useState<CandidateDetails>({ name: "", email: "", phone: "" })

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
            if (!allowedTypes.includes(selectedFile.type)) {
                setError("Invalid file type. Please upload a PDF or DOCX.")
                setFile(null)
            } else {
                setFile(selectedFile)
                setError(null)
            }
        }
    }

    const handleParse = async () => {
        if (!file) return
        setIsParsing(true)
        setError(null)

        try {
            let text = '';
            const arrayBuffer = await file.arrayBuffer();

            if (file.type === "application/pdf") {
                const typedarray = new Uint8Array(arrayBuffer);
                const pdf = await pdfjs.getDocument(typedarray).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    text += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
                }
            } else {
                const mammothResult = await mammoth.extractRawText({ arrayBuffer });
                text = mammothResult.value;
            }

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
            const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
            const nameRegex = /^([A-Z][a-z]+(?: [A-Z][a-z]+)?)/

            const parsedDetails: CandidateDetails = {
                email: text.match(emailRegex)?.[0] || "",
                phone: text.match(phoneRegex)?.[0] || "",
                name: text.match(nameRegex)?.[0] || "",
            }

            setDetails(parsedDetails);

            if (!parsedDetails.name || !parsedDetails.email || !parsedDetails.phone) {
                toast.info("Some details were missing.", {
                    description: "Please confirm the extracted information below.",
                });
                setPhase("COLLECTING_INFO");
            } else {
                toast.success("Resume parsed successfully!");
                onUploadSuccess(parsedDetails);
            }

        } catch (err) {
            toast.error("Failed to parse file", { description: "Please ensure the file is valid and not corrupted." });
            setError("Failed to parse the file. Please try another one.")
            console.error("Parsing error:", err)
        } finally {
            setIsParsing(false)
        }
    }

    const handleConfirmDetails = () => {
        if (!details.name || !details.email || !details.phone) {
            toast.warning("All fields are required.", {
                description: "Please fill in all the details to continue.",
            });
            return;
        }
        toast.success("Details confirmed!");
        onUploadSuccess(details);
    }

    if (phase === "COLLECTING_INFO") {
        return (
            <Card className="p-8 max-w-lg backdrop-blur-sm w-full">
                <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold">Confirm Your Details</CardTitle>
                    <CardDescription>We extracted the following information. Please fill in any missing fields.</CardDescription>
                </CardHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} placeholder="e.g., Jane Doe" />
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} placeholder="e.g., jane.doe@email.com" />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} placeholder="e.g., +91 9876543210" />
                    </div>
                    <Button onClick={handleConfirmDetails} size="lg" className="w-full gap-2">
                        Confirm & Start Interview <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-8 max-w-lg backdrop-blur-sm">
            <h1 className="text-3xl font-bold">AI Interview Assistant</h1>
            <p className="text-muted-foreground mt-2 mb-6">
                Please upload your resume to begin. We accept both PDF and DOCX files.
            </p>
            <div className="space-y-4">
                <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="file:text-foreground" />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={handleParse} size="lg" className="w-full gap-2" disabled={!file || isParsing}>
                    {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {isParsing ? "Parsing Resume..." : "Upload & Start"}
                </Button>
            </div>
        </Card>
    )
}