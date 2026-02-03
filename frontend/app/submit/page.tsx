"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, APIError } from "@/lib/api";
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

export default function SubmitTicketPage() {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (content.trim().length < 10) {
            setError("Please provide at least 10 characters");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const ticket = await api.createTicket({ request_content: content });

            setSuccess(`Ticket created successfully! ID: ${ticket.id}`);
            setContent("");

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (err) {
            if (err instanceof APIError) {
                setError(err.message);
            } else {
                setError("Failed to create ticket. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Submit a Support Ticket</CardTitle>
                        <CardDescription>
                            Describe your issue and get instant acknowledgment. Our AI will analyze and categorize your ticket in the background.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                    Describe your issue *
                                </label>
                                <Textarea
                                    id="content"
                                    placeholder="My account is locked and I can't access the dashboard. I've tried resetting my password but still can't log in..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={8}
                                    disabled={isSubmitting}
                                    className="w-full"
                                    required
                                    minLength={10}
                                    maxLength={5000}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {content.length}/5000 characters (minimum 10)
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium">{success}</p>
                                        <p className="text-green-700 mt-1">Redirecting to dashboard...</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || content.trim().length < 10}
                                    className="flex-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Ticket"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setContent("")}
                                    disabled={isSubmitting}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">
                                What happens next?
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>✓ Your ticket is saved instantly (< 100ms)</li>
                                <li>✓ AI processes it in the background (3-5 seconds)</li>
                                <li>✓ You'll see real-time status updates on the dashboard</li>
                                <li>✓ Get automated categorization and draft responses</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
