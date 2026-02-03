"use client";

import {
    Plus,
    Layers,
    Brain,
    CheckCircle2
} from "lucide-react";

export function ProcessSection() {
    return (
        <section
            className="py-32 relative overflow-hidden"
            style={{
                background: '#0C0A09', // Warm Stone Base
            }}
        >
            {/* Ambient Warm Glows */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-stone-800/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative mx-auto px-6 max-w-7xl">
                <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-10 border-b border-stone-800 pb-12">
                    <div>
                        <span className="text-amber-500/80 font-mono text-xs uppercase tracking-widest mb-4 block">Workflow Architecture</span>
                        <h2 className="text-4xl font-serif font-bold text-[#F5F5F0] leading-tight">
                            Systematic <span className="text-stone-500 italic">Precision</span>
                        </h2>
                    </div>
                    <p className="text-stone-400 max-w-md text-sm leading-relaxed mb-1 font-light">
                        A linear, automated pipeline designed to reduce resolution time by 60%.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Behind) - Designed as a sophisticated progress track */}
                    <div className="hidden md:block absolute top-[60px] left-0 w-full h-[2px] bg-gradient-to-r from-stone-900 via-amber-900/40 to-stone-900" />

                    {/* Moving Light Effect on Track */}
                    <div className="hidden md:block absolute top-[60px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {[
                            {
                                step: "01",
                                title: "Ingest",
                                desc: "Universal capture via API & UI forms.",
                                icon: Plus,
                            },
                            {
                                step: "02",
                                title: "Process",
                                desc: "Async celery workers normalize data.",
                                icon: Layers,
                            },
                            {
                                step: "03",
                                title: "Analyze",
                                desc: "AI engines classify & detect intent.",
                                icon: Brain,
                            },
                            {
                                step: "04",
                                title: "Resolve",
                                desc: "Smart routing & auto-response generation.",
                                icon: CheckCircle2,
                            }
                        ].map((item, i) => (
                            <div key={i} className="group relative">
                                {/* Card: Professional Glass-like Cream */}
                                <div className="w-full bg-[#FCFCFA] rounded-xl p-6 relative border border-stone-200/60 shadow-lg shadow-stone-950/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10 hover:border-amber-500/20">
                                    {/* Step Number Badge */}
                                    <div className="absolute -top-4 left-6 bg-stone-900 text-[#F5F5F0] px-3 py-1 text-xs font-bold rounded-full border-4 border-[#0C0A09] group-hover:bg-amber-600 transition-colors duration-500">
                                        {item.step}
                                    </div>

                                    <div className="mb-6 mt-2 flex justify-center md:justify-start">
                                        <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-white transition-all duration-500">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Connector Dot (Desktop) - Enhanced */}
                                <div className="hidden md:block absolute top-[56px] -right-4 w-2.5 h-2.5 rounded-full bg-stone-800 group-hover:bg-amber-500 group-hover:scale-125 transition-all duration-500 ring-4 ring-[#0C0A09] z-20 shadow-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
