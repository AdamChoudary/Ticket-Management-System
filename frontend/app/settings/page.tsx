"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Shield, Key, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";
import { api } from "@/lib/api";

export default function SettingsPage() {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState("");
    const [isStored, setIsStored] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

    useEffect(() => {
        // Load key from local storage on mount
        const stored = localStorage.getItem("gemini_api_key");
        if (stored) {
            setApiKey(stored);
            setIsStored(true);
        }
    }, []);

    const handleTest = async () => {
        if (!apiKey.trim()) {
            toast("Please enter an API key first", "warning");
            return;
        }

        if (!apiKey.startsWith("AIza")) {
            toast("Invalid API Key format (should start with AIza)", "warning");
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await api.testApiKey(apiKey.trim());
            setTestResult(result);

            if (result.valid) {
                toast("✅ API key is valid and working!", "success");
            } else {
                toast(`❌ ${result.message}`, "error");
            }
        } catch (error: any) {
            const errorMessage = error.message || "Failed to test API key";
            setTestResult({ valid: false, message: errorMessage });
            toast(`❌ ${errorMessage}`, "error");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = () => {
        if (!apiKey.trim()) {
            localStorage.removeItem("gemini_api_key");
            setIsStored(false);
            setTestResult(null);
            toast("API Key removed", "info");
            return;
        }

        if (!apiKey.startsWith("AIza")) {
            toast("Invalid API Key format (should start with AIza)", "warning");
            return;
        }

        localStorage.setItem("gemini_api_key", apiKey.trim());
        setIsStored(true);
        toast("✅ API Key saved securely in browser", "success");
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
                        <p className="text-stone-400 mt-1">Configure your LLM API key and dashboard preferences</p>
                    </div>
                </div>

                {/* API Key Card */}
                <div className="border border-stone-800 bg-[#141210] rounded-xl p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Key className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-2">Gemini API Key (BYOK)</h2>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                Use your own Google Gemini API key for ticket analysis.
                                Your key is stored <strong>locally in your browser</strong> and sent with each request via the <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded text-xs">X-Gemini-Key</code> header.
                                It is never saved to our servers.
                            </p>
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2 hover:underline"
                            >
                                Get your free Gemini API key →
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <label className="block text-sm font-medium text-stone-300">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setTestResult(null); // Clear test result on change
                                }}
                                placeholder="AIzaSy..."
                                className="w-full bg-[#1C1917] border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm pr-24"
                            />
                            {isStored && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-green-400">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Saved</span>
                                </div>
                            )}
                        </div>

                        {/* Test Result */}
                        {testResult && (
                            <div className={`flex items-start gap-3 p-4 rounded-lg border ${testResult.valid
                                    ? 'bg-green-500/5 border-green-500/20 text-green-400'
                                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                                }`}>
                                {testResult.valid ? (
                                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-sm">
                                        {testResult.valid ? 'Success!' : 'Validation Failed'}
                                    </p>
                                    <p className="text-xs mt-1 opacity-80">
                                        {testResult.message}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <Shield className="h-3 w-3" />
                                <span>Encrypted over HTTPS • Client-Side Only</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleTest}
                                    disabled={isTesting || !apiKey.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 font-medium rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTesting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Test Key
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!apiKey.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="border border-stone-800 bg-[#141210] rounded-xl p-6">
                    <h3 className="font-semibold mb-3 text-sm">How it works</h3>
                    <ol className="space-y-2 text-sm text-stone-400">
                        <li className="flex items-start gap-3">
                            <span className="text-purple-400 font-mono">1.</span>
                            <span>Enter your Gemini API key above and click <strong className="text-stone-300">"Test Key"</strong> to validate it works</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-purple-400 font-mono">2.</span>
                            <span>Click <strong className="text-stone-300">"Save Key"</strong> to store it locally in your browser (not on our servers)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-purple-400 font-mono">3.</span>
                            <span>Your key will be automatically included as a header (<code className="text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded text-xs">X-Gemini-Key</code>) with all AI requests</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-purple-400 font-mono">4.</span>
                            <span>Backend prioritizes your key over the server's default key (if any)</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
