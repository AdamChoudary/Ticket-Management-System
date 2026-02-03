"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section
            className="relative py-32 overflow-hidden"
            style={{ background: '#0C0A09' }}
        >
            <div className="container relative z-10 mx-auto px-6 text-center">
                <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#FAFAF9] mb-8 tracking-tighter">
                    Ready to <span className="italic text-stone-500">Deploy?</span>
                </h2>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/submit">
                        <Button
                            size="xl"
                            className="group relative px-12 py-8 text-lg font-bold overflow-hidden"
                            style={{
                                background: '#1C1917', // Stone-900
                                boxShadow: '0 8px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(231, 229, 228, 0.3)', // Champagne border
                                color: '#FAFAF9'
                            }}
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
