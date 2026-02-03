"use client";

import {
    Zap,
    Brain,
    Activity,
    Shield,
    Workflow,
    BarChart3
} from "lucide-react";

export function FeaturesSection() {
    return (
        <section className="py-32 relative overflow-hidden" style={{ background: '#0C0A09' }}>
            {/* Ambient background glow (Platinum Mist) */}
            <div className="absolute top-0 left-1/4 w-[1000px] h-[500px] bg-stone-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/50 border border-stone-800 text-stone-400 text-xs uppercase tracking-widest mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                        Elite Capabilities
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#F5F5F0] mb-6 tracking-tight">
                        Intelligence, <span className="italic text-stone-400">Refined.</span>
                    </h2>
                    <p className="text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Engineered for those who demand precision. A suite of tools designed to elevate support from distinct to distinguished.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Zap,
                            title: "Instant Ingestion",
                            desc: "Sub-100ms response time ensures zero latency. Event-driven architecture handles peak enterprise loads effortlessly.",
                            color: "text-amber-200"
                        },
                        {
                            icon: Brain,
                            title: "Semantic Analysis",
                            desc: "Deep context understanding via advanced LLMs. Routes tickets with 99% accuracy based on sentiment and intent.",
                            color: "text-orange-100"
                        },
                        {
                            icon: Activity,
                            title: "Real-time Telemetry",
                            desc: "Live pulse monitoring via WebSockets. Watch your support ecosystem evolve in real-time, every 3 seconds.",
                            color: "text-stone-200"
                        },
                        {
                            icon: Shield,
                            title: "Bank-Grade Security",
                            desc: "AES-256 encryption, role-based governance, and immutable audit logs. Security that never sleeps.",
                            color: "text-emerald-100"
                        },
                        {
                            icon: Workflow,
                            title: "Smart Workflows",
                            desc: "Autonomous agents that tag, categorize, and draft responses. Automate the mundane, focus on the exceptional.",
                            color: "text-rose-100"
                        },
                        {
                            icon: BarChart3,
                            title: "Deep Insights",
                            desc: "Uncover hidden patterns in your data. Beautiful, exportable reports that drive strategic decision making.",
                            color: "text-indigo-100"
                        }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="group relative p-10 rounded-xl bg-[#141210] border border-white/[0.03] hover:bg-[#1C1815] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-950/50"
                        >
                            <div
                                className={`w-12 h-12 rounded-lg bg-stone-900/80 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}
                            >
                                <feature.icon className={`h-5 w-5 ${feature.color} opacity-80`} />
                            </div>
                            <h3 className="text-xl font-medium text-[#EBEBF5] mb-4">{feature.title}</h3>
                            <p className="text-stone-500 leading-relaxed text-sm font-light">
                                {feature.desc}
                            </p>

                            {/* Golden corner accent on hover */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
