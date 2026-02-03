

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    LayoutDashboard,
    Plus,
    Zap,
    Brain,
    Activity,
    ArrowRight,
    TrendingUp
} from "lucide-react";

export function HeroSection() {
    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            style={{
                background: '#0C0A09', // Deep Stone Base
            }}
        >
            {/* Ambient Mist Glows (Platinum/Silver) */}
            <div
                className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
                style={{
                    background: 'radial-gradient(circle, #E7E5E4 0%, transparent 70%)', // Platinum
                }}
            />
            <div
                className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full blur-[100px] opacity-5"
                style={{
                    background: 'radial-gradient(circle, #F5F5F4 0%, transparent 70%)', // Warm White
                }}
            />

            {/* Fine grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px',
                }}
            />

            {/* Content */}
            <div className="container relative z-10 mx-auto px-6 max-w-6xl">
                <div className="text-center">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-md"
                        style={{
                            background: 'rgba(231, 229, 228, 0.05)', // Stone-200 tint
                            border: '1px solid rgba(231, 229, 228, 0.2)',
                            color: '#E7E5E4', // Platinum
                            animation: 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
                        }}
                    >
                        <Sparkles className="h-4 w-4" />
                        Concierge-Level Support Intelligence
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-8"
                        style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards' }}
                    >
                        <span className="block text-[#FAFAF9] mb-2 tracking-tight">
                            Elevate Experience
                        </span>
                        <span
                            className="block italic"
                            style={{
                                background: 'linear-gradient(to right, #E7E5E4, #A8A29E)', // Platinum to Stone
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Beyond Expectation
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p
                        className="text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light"
                        style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards' }}
                    >
                        Precision-engineered AI for support teams who demand excellence. Automated analysis, sentiment detection, and intelligent categorization.
                    </p>

                    {/* CTAs */}
                    <div
                        className="flex flex-wrap justify-center gap-5 mb-24"
                        style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards' }}
                    >
                        <Link href="/submit">
                            <Button
                                size="lg"
                                className="group relative px-10 py-7 text-base font-semibold transition-all duration-300 hover:scale-105"
                                style={{
                                    background: '#1C1917', // Stone-900
                                    boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(231, 229, 228, 0.3)', // Champagne border
                                    color: '#FAFAF9'
                                }}
                            >
                                <span className="relative z-10 flex items-center">
                                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                    Initiate Request
                                    <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                                </span>
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button
                                size="lg"
                                variant="outline"
                                className="group px-10 py-7 text-base font-semibold text-stone-400 transition-all duration-300 hover:text-[#FAFAF9] hover:border-stone-400"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                }}
                            >
                                <LayoutDashboard className="mr-2 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                Executive Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* Stats - Platinum Stone Cards */}
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
                        style={{ animation: 'fadeIn 0.8s ease 0.3s backwards' }}
                    >
                        {[
                            { icon: Zap, value: "<100ms", label: "latency" },
                            { icon: Brain, value: "AI-Core", label: "analysis" },
                            { icon: Activity, value: "Live", label: "updates" },
                            { icon: TrendingUp, value: "99.9%", label: "uptime" }
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="group relative p-6 rounded-xl text-left transition-all duration-500 hover:-translate-y-1"
                                style={{
                                    background: 'linear-gradient(to bottom right, #1C1917, #171717)', // Stone 900
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                {/* Top border highlight - Platinum */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-stone-500 to-transparent opacity-30 group-hover:opacity-60 transition-opacity" />

                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-900 border border-stone-800 group-hover:border-stone-600 transition-colors"
                                    >
                                        <stat.icon className="h-5 w-5 text-stone-400 group-hover:text-stone-200 transition-colors" />
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-stone-800 group-hover:bg-stone-500 transition-colors" />
                                </div>

                                <div className="text-2xl font-bold text-[#FAFAF9] mb-1 tracking-tight">{stat.value}</div>
                                <div className="text-xs font-medium text-stone-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

