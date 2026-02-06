"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Shield, Key } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";

export default function SettingsPage() {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState("");
    const [isStored, setIsStored] = useState(false);

    useEffect(() => {
        // Load key from local storage on mount
        const stored = localStorage.getItem("gemini_api_key");
        if (stored) {
            setApiKey(stored);
            setIsStored(true);
        }
    }, []);

    const handleSave = () => {
        if (!apiKey.trim()) {
            localStorage.removeItem("gemini_api_key");
            setIsStored(false);
            toast("API Key removed", "info");
            return;
        }

        if (!apiKey.startsWith("AIza")) {
            toast("Invalid API Key format (should start with AIza)", "warning");
            return;
        }

        localStorage.setItem("gemini_api_key", apiKey.trim());
        setIsStored(true);
        toast("API Key saved securely", "success");
    };

    return (
        <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9] p-8">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in run-once">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-stone-400 mt-1">Configure your AI preferences</p>
                    </div>
                </div>

                {/* API Key Card */}
                <div className="border border-stone-800 bg-[#141210] rounded-xl p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Key className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Bring Your Own Key (BYOK)</h2>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                Enter your personal Google Gemini API Key to skip the shared quota and use custom models.
                                Your key is stored <strong>locally in your browser</strong> and sent directly to the AI service.
                                It is never saved to our database.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <label className="block text-sm font-medium text-stone-300">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            className="w-full bg-[#1C1917] border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                        />
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <Shield className="h-3 w-3" />
                                <span>Encrypted over HTTPS • Client-Side Only</span>
                            </div>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-stone-200 transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
