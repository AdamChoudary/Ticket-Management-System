"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, APIError } from "@/lib/api";
import { Loader2, ArrowLeft, Send, Eraser, Sparkles, Zap, Brain, CheckCircle2, Info, Shield } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export default function SubmitTicketPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContent(value);
        setCharCount(value.length);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedContent = content.trim();

        if (trimmedContent.length < 10) {
            toast("Please provide at least 10 characters", "error");
            return;
        }

        if (trimmedContent.length > 5000) {
            toast("Content exceeds maximum length of 5000 characters", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const ticket = await api.createTicket({ request_content: trimmedContent });

            toast("Ticket created successfully!", "success");
            setContent("");
            setCharCount(0);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);

        } catch (err) {
            if (err instanceof APIError) {
                toast(err.message, "error");
            } else {
                toast("Failed to create ticket. Please try again.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = content.trim().length >= 10 && content.trim().length <= 5000;
    const progressPercentage = Math.min((charCount / 5000) * 100, 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-white opacity-10" />

            <div className="container relative mx-auto px-5 md:px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header Navigation */}
                    <div className="mb-8 animate-slide-down">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="mb-6 text-slate-300 hover:text-white hover:bg-slate-800">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>

                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-300">AI-Powered Ticket System</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                            Submit a Support Ticket
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Describe your issue in detail. Our AI will analyze and categorize your ticket automatically within seconds.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <Card className="glass-dark border-2 border-slate-700/50 mb-8 animate-slide-up overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border-b border-slate-700/50 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-400" />
                                New Support Request
                            </h2>
                        </div>

                        <CardContent className="p-5 md:p-6 lg:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="content" className="block text-sm font-bold text-slate-200 mb-3">
                                        Describe Your Issue <span className="text-red-400">*</span>
                                    </label>
                                    <Textarea
                                        id="content"
                                        placeholder="Example: My account has been locked since yesterday. I've tried resetting my password multiple times, but the reset email never arrives. This is urgent as I need access to process pending customer orders and view my dashboard analytics."
                                        value={content}
                                        onChange={handleContentChange}
                                        rows={10}
                                        disabled={isSubmitting}
                                        className="w-full resize-none text-sm md:text-base leading-relaxed bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                                        required
                                        maxLength={5000}
                                        aria-describedby="char-count"
                                    />

                                    {/* Character Counter */}
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p
                                                id="char-count"
                                                className={`text-sm font-semibold ${charCount < 10
                                                    ? "text-red-400"
                                                    : charCount > 4500
                                                        ? "text-amber-400"
                                                        : "text-emerald-400"
                                                    }`}
                                            >
                                                {charCount.toLocaleString()} / 5,000 characters
                                                {charCount < 10 && charCount > 0 && (
                                                    <span className="ml-2 text-red-400">
                                                        ({10 - charCount} more needed)
                                                    </span>
                                                )}
                                            </p>
                                            {charCount >= 10 && (
                                                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Valid length
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        {charCount > 0 && (
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${charCount < 10
                                                        ? "bg-gradient-to-r from-red-500 to-red-600"
                                                        : charCount > 4500
                                                            ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                                            : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                                        }`}
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !isValid}
                                        className="flex-1 text-sm md:text-base py-5 md:py-6 glow-blue-subtle hover-glow bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                                        size="lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Submit Ticket
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            setContent("");
                                            setCharCount(0);
                                        }}
                                        disabled={isSubmitting || content.length === 0}
                                        className="px-6 md:px-8 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
                                    >
                                        <Eraser className="mr-2 h-5 w-5" />
                                        Clear
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Feature Grid */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="glass-dark p-6 rounded-xl border border-slate-700/50 hover:bg-white/5 transition-all duration-300">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <Zap className="h-5 md:h-6 w-5 md:w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-white mb-2 text-base md:text-lg">Instant Response</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Your ticket is saved in &lt; 100ms with immediate confirmation and unique ID.
                            </p>
                        </div>

                        <div className="glass-dark p-6 rounded-xl border border-slate-700/50 hover:bg-white/5 transition-all duration-300">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <Brain className="h-5 md:h-6 w-5 md:w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-white mb-2 text-base md:text-lg">AI Analysis</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Background processing categorizes and analyzes sentiment within 3-5 seconds.
                            </p>
                        </div>

                        <div className="glass-dark p-6 rounded-xl border border-slate-700/50 hover:bg-white/5 transition-all duration-300">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <CheckCircle2 className="h-5 md:h-6 w-5 md:w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-white mb-2 text-base md:text-lg">Live Tracking</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Monitor your ticket's progress in real-time on the dashboard.
                            </p>
                        </div>
                    </div>

                    {/* Process Timeline */}
                    <div className="glass-dark p-5 md:p-6 lg:p-8 rounded-xl border border-slate-700/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-2 mb-6">
                            <Info className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg font-bold text-white">What Happens Next?</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                            {[
                                { num: "1", title: "Instant Save", desc: "Ticket stored in PostgreSQL database immediately" },
                                { num: "2", title: "Queue Job", desc: "Celery worker picks up task from Redis queue" },
                                { num: "3", title: "AI Processing", desc: "Analyzes urgency, sentiment (1-10), and category" },
                                { num: "4", title: "Live Updates", desc: "Dashboard shows real-time status changes every 3s" }
                            ].map((step) => (
                                <div key={step.num} className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                                        {step.num}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-200 leading-relaxed">
                                            <span className="font-bold">{step.title}:</span> {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
