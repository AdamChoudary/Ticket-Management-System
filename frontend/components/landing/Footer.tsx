"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-24 border-t border-white/5" style={{ background: '#0C0A09' }}>
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="h-5 w-5 text-stone-400" />
                            <span className="font-bold text-[#FAFAF9] tracking-tight">AI Support Hub</span>
                        </div>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            Elevating customer support with precision engagement and intelligent automation.
                        </p>
                    </div>

                    {/* Links Columns */}
                    {[
                        { title: "Product", links: ["Features", "Integrations", "Enterprise", "Security"] },
                        { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
                        { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy", "Licenses"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-[#FAFAF9] font-medium mb-6">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="text-stone-500 text-sm hover:text-stone-300 transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-stone-600 text-xs">© 2026 AI Support Hub Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        {/* Social placeholders */}
                        <div className="w-5 h-5 bg-stone-900 rounded-full hover:bg-stone-800 transition-colors cursor-pointer" />
                        <div className="w-5 h-5 bg-stone-900 rounded-full hover:bg-stone-800 transition-colors cursor-pointer" />
                        <div className="w-5 h-5 bg-stone-900 rounded-full hover:bg-stone-800 transition-colors cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
