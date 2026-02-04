"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { api, APIError } from "@/lib/api";
import { Loader2, ArrowLeft, Send, Eraser, Sparkles, Zap, Brain, CheckCircle2, Info } from "lucide-react";
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
            await api.createTicket({ request_content: trimmedContent });

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
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: '#0C0A09' }}>
            {/* Ambient Mist Glows (Platinum) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative mx-auto px-5 md:px-4 py-8 md:py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header Navigation */}
                    <div className="mb-8 animate-slide-down text-center md:text-left">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="mb-6 text-stone-500 hover:text-[#FAFAF9] hover:bg-stone-900 transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>

                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-stone-900/50 border border-stone-800 backdrop-blur-sm mx-auto md:mx-0">
                            <Sparkles className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">Concierge Intake</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#FAFAF9] mb-3 tracking-tight">
                            Submit Request
                        </h1>
                        <p className="text-lg text-stone-500 leading-relaxed font-light">
                            Describe your issue. Our intelligent agents will classify and route it instantly.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <Card
                        className="relative overflow-hidden mb-12 animate-slide-up"
                        style={{
                            background: '#141210', // Deep Stone
                            border: '1px solid rgba(231, 229, 228, 0.1)', // Subtle Platinum
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Top Accent Line */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-stone-500/50 to-transparent" />

                        <CardContent className="p-6 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium text-stone-400 mb-4 uppercase tracking-wider">
                                        Request Details
                                    </label>
                                    <div className="relative group">
                                        <Textarea
                                            id="content"
                                            placeholder="Please describe your technical issue..."
                                            value={content}
                                            onChange={handleContentChange}
                                            rows={8}
                                            disabled={isSubmitting}
                                            className="w-full resize-none text-base leading-relaxed p-6 rounded-lg transition-all duration-300"
                                            style={{
                                                background: '#0C0A09',
                                                border: '1px solid #292524', // Stone-800
                                                color: '#FAFAF9',
                                            }}
                                            required
                                            maxLength={5000}
                                        />
                                        {/* Focus Ring Animation would go here in CSS, but inline style serves for now */}
                                    </div>

                                    {/* Character Counter */}
                                    <div className="mt-4 flex justify-between items-center px-1">
                                        <div className="flex items-center gap-3">
                                            {/* Minimalist Progress Bar */}
                                            <div className="w-24 h-1 bg-stone-900 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-500 bg-stone-500"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-stone-600 font-mono">
                                                {charCount} / 5000
                                            </span>
                                        </div>

                                        {charCount >= 10 && (
                                            <span className="text-xs text-stone-500 flex items-center gap-1.5 animate-fadeIn">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Ready to submit
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !isValid}
                                        className="flex-1 text-base py-6 font-semibold transition-all duration-300 group relative overflow-hidden"
                                        style={{
                                            background: '#1C1917',
                                            border: '1px solid rgba(231, 229, 228, 0.2)',
                                            color: '#FAFAF9'
                                        }}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Initiate Sequence
                                                    <Send className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                        {/* Hover Fill */}
                                        <div className="absolute inset-0 bg-stone-800/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setContent("");
                                            setCharCount(0);
                                        }}
                                        disabled={isSubmitting || content.length === 0}
                                        className="py-6 px-6 text-stone-500 hover:text-stone-300 hover:bg-stone-900/50 border border-transparent hover:border-stone-800"
                                    >
                                        <Eraser className="h-5 w-5" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Minimal Features */}
                    <div className="grid grid-cols-3 gap-4 border-t border-stone-800/50 pt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {[
                            { icon: Zap, label: "Instant Ingest", desc: "<100ms Latency" },
                            { icon: Brain, label: "AI Analysis", desc: "Semantic Classify" },
                            { icon: Info, label: "Live Trace", desc: "Real-time Status" }
                        ].map((item, i) => (
                            <div key={i} className="text-center group">
                                <item.icon className="h-5 w-5 text-stone-600 group-hover:text-stone-400 mx-auto mb-2 transition-colors duration-300" />
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{item.label}</h3>
                                <p className="text-[10px] text-stone-600 font-mono">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
