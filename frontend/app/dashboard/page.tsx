"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Ticket, TicketStatus } from "@/lib/types";
import {
    Ticket as TicketIcon,
    Database,
    Settings,
    LogOut,
    Search,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    Clock,
    CheckCircle2,
    Sparkles,
    FileText,
    DollarSign,
    Wrench,
    Zap,
    Save,
    X,
    LoaderCircle,
    Brain,
    Activity,
    BarChart3,
    Users,
    TrendingUp,
    Trash2,
    TestTube,
    Key,
    AlertCircle,
    CheckCircle,
    Info,
    HardDrive,
    Download
} from "lucide-react";
import { useToast } from "@/components/toast-provider";

// Matched color theme from landing page
const THEME = {
    background: '#0C0A09',      // Deep Stone Base
    surface: '#1C1917',         // Stone-900
    surfaceElevated: '#292524', // Stone-800
    platinum: '#E7E5E4',        // Stone-200
    platinumLight: '#FAFAF9',   // Stone-50
    stone: '#A8A29E',           // Stone-400
    stoneDark: '#78716C',       // Stone-500
    border: 'rgba(231, 229, 228, 0.1)',  // Platinum 10%
    borderLight: 'rgba(231, 229, 228, 0.05)',
};

// Status styling
const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
        case "pending":
            return "bg-amber-500/10 text-amber-400 border-amber-500/30";
        case "processing":
            return "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse";
        case "completed":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        default:
            return "bg-stone-700/50 text-stone-500 border-stone-700";
    }
};

const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
        case "High":
            return "bg-red-500/10 text-red-400 border-red-500/30";
        case "Medium":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        case "Low":
            return "bg-green-500/10 text-green-400 border-green-500/30";
        default:
            return "bg-stone-700/50 text-stone-500 border-stone-700";
    }
};

// Sidebar Navigation Component
function Sidebar({ activeView, setActiveView, isCollapsed, setIsCollapsed }: {
    activeView: string;
    setActiveView: (view: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}) {
    const navItems = [
        { id: 'tickets', label: 'Tickets', icon: TicketIcon },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'database', label: 'Database', icon: Database },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <motion.aside
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="relative flex flex-col border-r"
            style={{
                background: THEME.surface,
                borderColor: THEME.border,
            }}
        >
            {/* Logo / Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: THEME.border }}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" style={{ color: THEME.platinum }} />
                        <span className="font-serif font-bold text-lg" style={{ color: THEME.platinumLight }}>
                            Agent Hub
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" style={{ color: THEME.stone }} />
                    ) : (
                        <ChevronLeft className="h-4 w-4" style={{ color: THEME.stone }} />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-white/10 shadow-lg'
                                : 'hover:bg-white/5'
                                }`}
                            style={{
                                color: isActive ? THEME.platinumLight : THEME.stone,
                            }}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}
                            {isActive && !isCollapsed && (
                                <ChevronRight className="h-4 w-4 ml-auto" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t space-y-2" style={{ borderColor: THEME.border }}>
                <Link href="/">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ color: THEME.stone }}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">Exit</span>}
                    </button>
                </Link>
            </div>
        </motion.aside>
    );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, trend }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: string;
}) {
    return (
        <div
            className="rounded-xl p-6 border"
            style={{
                background: THEME.surfaceElevated,
                borderColor: THEME.border,
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="p-3 rounded-lg"
                    style={{
                        background: 'rgba(231, 229, 228, 0.05)',
                        border: `1px solid ${THEME.borderLight}`,
                    }}
                >
                    <Icon className="h-5 w-5" style={{ color: THEME.platinum }} />
                </div>
                {trend && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <div
                    className="text-3xl font-bold"
                    style={{ color: THEME.platinumLight }}
                >
                    {value}
                </div>
                <div className="text-sm font-medium" style={{ color: THEME.stone }}>
                    {title}
                </div>
            </div>
        </div>
    );
}

// Ticket Card Component
function TicketCard({ ticket, onUpdate }: { ticket: Ticket; onUpdate: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDraft, setEditedDraft] = useState(ticket.draft_response || "");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            await api.updateTicket(ticket.id, { draft_response: editedDraft });
            toast("Draft saved successfully", "success");
            setIsEditing(false);
            onUpdate();
        } catch (e) {
            toast("Failed to save draft", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResolve = async () => {
        setIsSaving(true);
        try {
            await api.updateTicket(ticket.id, { status: "completed" });
            toast("Ticket resolved", "success");
            onUpdate();
        } catch (e) {
            toast("Failed to resolve ticket", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            layout
            className="rounded-lg border overflow-hidden"
            style={{
                background: THEME.surfaceElevated,
                borderColor: THEME.border,
            }}
        >
            {/* Header */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="px-5 py-4 cursor-pointer flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
                {/* Status */}
                <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(ticket.status)}`}>
                    {ticket.status}
                </div>

                {/* Category */}
                {ticket.category && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border" style={{ borderColor: THEME.borderLight }}>
                        {ticket.category === "Billing" && <DollarSign className="h-3 w-3" style={{ color: THEME.stone }} />}
                        {ticket.category === "Technical" && <Wrench className="h-3 w-3" style={{ color: THEME.stone }} />}
                        {ticket.category === "Feature" && <Zap className="h-3 w-3" style={{ color: THEME.stone }} />}
                        {ticket.category === "Other" && <FileText className="h-3 w-3" style={{ color: THEME.stone }} />}
                        <span className="text-[10px] font-semibold" style={{ color: THEME.stone }}>{ticket.category}</span>
                    </div>
                )}

                {/* Urgency */}
                {ticket.urgency && (
                    <div className={`px-3 py-1 rounded text-[10px] font-semibold border ${getUrgencyStyles(ticket.urgency)}`}>
                        {ticket.urgency}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-1 font-medium" style={{ color: THEME.platinum }}>
                        {ticket.request_content}
                    </p>
                </div>

                {/* Sentiment */}
                {ticket.sentiment_score != null && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border" style={{ borderColor: THEME.borderLight }}>
                        <Sparkles className="h-3 w-3" style={{ color: THEME.platinum }} />
                        <span className="text-xs font-bold" style={{ color: THEME.platinum }}>
                            {ticket.sentiment_score.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Arrow */}
                <motion.div
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight className="h-5 w-5" style={{ color: THEME.stone }} />
                </motion.div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: THEME.border }}
                    >
                        <div className="px-5 py-6 space-y-6">
                            {/* Full Request */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: THEME.stone }}>
                                    <FileText className="h-3.5 w-3.5" />
                                    Request
                                </div>
                                <p className="text-sm leading-relaxed pl-5" style={{ color: THEME.platinum }}>
                                    {ticket.request_content}
                                </p>
                            </div>

                            {/* AI Draft Response */}
                            {ticket.draft_response && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: THEME.platinum }}>
                                            <Brain className="h-3.5 w-3.5" />
                                            AI Draft Response
                                        </div>
                                        {!isEditing && (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                size="sm"
                                                className="h-7 text-xs bg-white/5 hover:bg-white/10 border"
                                                style={{ borderColor: THEME.borderLight, color: THEME.platinum }}
                                            >
                                                ✏️ Edit
                                            </Button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3 pl-5">
                                            <textarea
                                                value={editedDraft}
                                                onChange={(e) => setEditedDraft(e.target.value)}
                                                className="w-full border rounded-lg p-4 text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2"
                                                style={{
                                                    background: THEME.surface,
                                                    borderColor: THEME.border,
                                                    color: THEME.platinum,
                                                }}
                                                placeholder="Edit AI response..."
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleSaveDraft}
                                                    disabled={isSaving}
                                                    size="sm"
                                                    className="h-8"
                                                    style={{
                                                        background: 'linear-gradient(to right, #E7E5E4, #A8A29E)',
                                                        color: THEME.background,
                                                    }}
                                                >
                                                    {isSaving ? (
                                                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Save className="h-3.5 w-3.5 mr-1.5" />
                                                            Save
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditedDraft(ticket.draft_response || "");
                                                    }}
                                                    size="sm"
                                                    className="h-8 bg-white/5 hover:bg-white/10"
                                                    style={{ color: THEME.platinum }}
                                                >
                                                    <X className="h-3.5 w-3.5 mr-1.5" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed pl-5 bg-white/5 border rounded-lg p-4" style={{ borderColor: THEME.borderLight, color: THEME.platinum }}>
                                            {ticket.draft_response}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center gap-6 text-xs pt-4 border-t" style={{ borderColor: THEME.border, color: THEME.stone }}>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                </div>
                                <div className="flex items-center gap-2 font-mono">
                                    <span>ID:</span>
                                    <span>{ticket.id.slice(0, 8)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {ticket.status !== "completed" && (
                                <div className="pt-2">
                                    <Button
                                        onClick={handleResolve}
                                        disabled={isSaving}
                                        className="w-full h-10 font-semibold"
                                        style={{
                                            background: 'linear-gradient(to right, #10b981, #059669)',
                                            color: 'white',
                                        }}
                                    >
                                        {isSaving ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Mark as Resolved
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Settings Panel Component
function SettingsPanel() {
    const [apiKey, setApiKey] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Load saved API key
        const saved = localStorage.getItem("gemini_api_key");
        if (saved) setApiKey(saved);
    }, []);

    const handleSaveKey = () => {
        localStorage.setItem("gemini_api_key", apiKey);
        toast("API key saved successfully", "success");
        setTestResult(null);
    };

    const handleClearKey = () => {
        localStorage.removeItem("gemini_api_key");
        setApiKey("");
        toast("API key cleared", "success");
        setTestResult(null);
    };

    const handleTestKey = async () => {
        if (!apiKey.trim()) {
            toast("Please enter an API key", "error");
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await api.testApiKey(apiKey);
            setTestResult(result);
            if (result.valid) {
                toast("API key is valid!", "success");
            } else {
                toast("API key test failed", "error");
            }
        } catch (error) {
            setTestResult({ valid: false, message: "Network error testing key" });
            toast("Failed to test API key", "error");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: THEME.platinumLight }}>
                    Settings
                </h2>
                <p className="text-sm" style={{ color: THEME.stone }}>
                    Configure your LLM API key and dashboard preferences
                </p>
            </div>

            {/* API Key Configuration */}
            <div className="rounded-xl border p-6 space-y-4" style={{ background: THEME.surfaceElevated, borderColor: THEME.border }}>
                <div className="flex items-center gap-2 mb-2">
                    <Key className="h-5 w-5" style={{ color: THEME.platinum }} />
                    <h3 className="text-lg font-semibold" style={{ color: THEME.platinumLight }}>
                        Gemini API Key (BYOK)
                    </h3>
                </div>

                <p className="text-sm text-stone-400">
                    Use your own Google Gemini API key for ticket processing. Get yours at{" "}
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-stone-200 underline">
                        Google AI Studio
                    </a>
                </p>

                {/* API Key Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: THEME.platinum }}>
                        API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setTestResult(null);
                        }}
                        placeholder="AIza..."
                        className="w-full h-12 px-4 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.platinum,
                        }}
                    />
                </div>

                {/* Test Result */}
                {testResult && (
                    <div
                        className={`flex items-start gap-3 p-4 rounded-lg border ${testResult.valid
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                            }`}
                    >
                        {testResult.valid ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${testResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                {testResult.valid ? 'Valid API Key' : 'Invalid API Key'}
                            </p>
                            <p className="text-xs mt-1" style={{ color: THEME.stone }}>
                                {testResult.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleTestKey}
                        disabled={isTesting || !apiKey.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        {isTesting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                        )}
                        Test Key
                    </Button>

                    <Button
                        onClick={handleSaveKey}
                        disabled={!apiKey.trim()}
                        style={{
                            background: 'linear-gradient(to right, #E7E5E4, #A8A29E)',
                            color: THEME.background,
                        }}
                        className="font-semibold"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Key
                    </Button>

                    <Button
                        onClick={handleClearKey}
                        className="bg-white/5 hover:bg-white/10"
                        style={{ color: THEME.platinum }}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-300 font-semibold">How it works</p>
                        <p className="text-xs mt-1 text-stone-400">
                            Your API key is stored locally in your browser and sent with each request via the X-Gemini-Key header.
                            It is never stored on our servers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Database Management Panel
function DatabasePanel() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showTicketTable, setShowTicketTable] = useState(false);
    const { toast } = useToast();

    // Fetch all tickets for management
    const { data: tickets, mutate: mutateTickets, error: ticketsError } = useSWR<Ticket[]>(
        showTicketTable ? "db-management-tickets" : null,
        async () => {
            try {
                console.log("Fetching tickets for management table...");
                const response = await api.getTickets({ limit: 1000 });
                console.log(`Loaded ${response.tickets.length} tickets`);
                return response.tickets;
            } catch (error) {
                console.error("Error fetching tickets:", error);
                throw error;
            }
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const loadStats = async () => {
        setIsLoadingStats(true);
        try {
            const data = await api.getDatabaseStats();
            setStats(data);
        } catch (error) {
            toast("Failed to load database stats", "error");
            console.error("Stats error:", error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleDeleteAll = async () => {
        const confirmed = window.confirm(
            "⚠️ CRITICAL WARNING\n\n" +
            "This will PERMANENTLY DELETE ALL TICKETS from the database.\n\n" +
            "• All ticket data will be lost\n" +
            "• All AI analysis results will be removed\n" +
            "• All draft responses will be deleted\n\n" +
            "This action CANNOT be undone!\n\n" +
            "Type 'DELETE ALL' in the next prompt to confirm."
        );

        if (!confirmed) return;

        const confirmation = window.prompt("Type 'DELETE ALL' to confirm:");
        if (confirmation !== "DELETE ALL") {
            toast("Deletion cancelled", "info");
            return;
        }

        setIsDeleting(true);
        try {
            await api.deleteAllTickets();
            toast("All tickets deleted successfully", "success");
            await loadStats();
            await mutateTickets();
        } catch (e) {
            console.error("Delete error:", e);
            toast("Failed to delete tickets", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        if (!window.confirm("Delete this ticket? This action cannot be undone.")) {
            return;
        }

        try {
            await api.deleteTicket(ticketId);
            toast("Ticket deleted", "success");
            await loadStats();
            await mutateTickets();
        } catch (e) {
            toast("Failed to delete ticket", "error");
        }
    };

    const handleExportJSON = async () => {
        setIsExporting(true);
        try {
            console.log("Starting JSON export...");
            const data = await api.exportTicketsJSON();
            console.log(`Fetched ${data.length} tickets for export`);

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast("JSON export downloaded", "success");
        } catch (e) {
            console.error("JSON export error:", e);
            const errorMsg = e instanceof Error ? e.message : String(e);
            toast(`Failed to export JSON: ${errorMsg}`, "error");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            console.log("Starting CSV export...");
            const csvContent = await api.exportTicketsCSV();
            console.log(`Generated CSV with ${csvContent.split('\n').length} lines`);

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast("CSV export downloaded", "success");
        } catch (e) {
            console.error("CSV export error:", e);
            const errorMsg = e instanceof Error ? e.message : String(e);
            toast(`Failed to export CSV: ${errorMsg}`, "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: THEME.platinumLight }}>
                    Database Management
                </h2>
                <p className="text-sm" style={{ color: THEME.stone }}>
                    Monitor, export, and manage your ticket database
                </p>
            </div>

            {/* Database Stats */}
            {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                    <LoaderCircle className="h-8 w-8 animate-spin" style={{ color: THEME.platinum }} />
                </div>
            ) : stats ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Database Size"
                            value={`${stats.database_size_mb} MB`}
                            icon={HardDrive}
                        />
                        <MetricCard
                            title="Active Connections"
                            value={`${stats.active_connections}/${stats.max_connections}`}
                            icon={Users}
                        />
                        <MetricCard
                            title="Total Tickets"
                            value={stats.total_tickets}
                            icon={Database}
                        />
                    </div>

                    {/* Detailed Stats */}
                    <div className="rounded-xl border p-6 space-y-4" style={{ background: THEME.surfaceElevated, borderColor: THEME.border }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: THEME.platinumLight }}>
                                Ticket Breakdown
                            </h3>
                            <Button
                                onClick={loadStats}
                                size="sm"
                                className="bg-white/5 hover:bg-white/10 border"
                                style={{ borderColor: THEME.border, color: THEME.platinum }}
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400 mb-1">{stats.pending}</div>
                                <div className="text-xs font-medium" style={{ color: THEME.stone }}>Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.processing}</div>
                                <div className="text-xs font-medium" style={{ color: THEME.stone }}>Processing</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.completed}</div>
                                <div className="text-xs font-medium" style={{ color: THEME.stone }}>Completed</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {stats.total_tickets > 0 && (
                            <div className="mt-6">
                                <div className="flex justify-between text-xs mb-2" style={{ color: THEME.stone }}>
                                    <span>Completion Rate</span>
                                    <span className="font-semibold text-emerald-400">
                                        {((stats.completed / stats.total_tickets) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                                        style={{ width: `${(stats.completed / stats.total_tickets) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Section */}
                    <div className="rounded-xl border p-6 space-y-4" style={{ background: THEME.surfaceElevated, borderColor: THEME.border }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="h-5 w-5" style={{ color: THEME.platinum }} />
                            <h3 className="text-lg font-semibold" style={{ color: THEME.platinumLight }}>
                                Data Export
                            </h3>
                        </div>

                        <p className="text-sm" style={{ color: THEME.stone }}>
                            Export all tickets and AI analysis data in your preferred format
                        </p>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleExportJSON}
                                disabled={isExporting || stats.total_tickets === 0}
                                className="font-semibold"
                                style={{
                                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                                    color: 'white',
                                }}
                            >
                                {isExporting ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                Export as JSON
                            </Button>

                            <Button
                                onClick={handleExportCSV}
                                disabled={isExporting || stats.total_tickets === 0}
                                className="font-semibold"
                                style={{
                                    background: 'linear-gradient(to right, #10b981, #059669)',
                                    color: 'white',
                                }}
                            >
                                {isExporting ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                Export as CSV
                            </Button>
                        </div>

                        {stats.total_tickets === 0 && (
                            <p className="text-xs text-amber-400">
                                No tickets to export
                            </p>
                        )}
                    </div>

                    {/* Ticket Management Table */}
                    <div className="rounded-xl border p-6 space-y-4" style={{ background: THEME.surfaceElevated, borderColor: THEME.border }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TicketIcon className="h-5 w-5" style={{ color: THEME.platinum }} />
                                <h3 className="text-lg font-semibold" style={{ color: THEME.platinumLight }}>
                                    Individual Ticket Management
                                </h3>
                            </div>
                            <Button
                                onClick={() => setShowTicketTable(!showTicketTable)}
                                size="sm"
                                className="bg-white/5 hover:bg-white/10 border"
                                style={{ borderColor: THEME.border, color: THEME.platinum }}
                            >
                                {showTicketTable ? 'Hide' : 'Show'} Tickets
                            </Button>
                        </div>

                        {showTicketTable && (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {!tickets ? (
                                    <div className="text-center py-8">
                                        <LoaderCircle className="h-8 w-8 animate-spin mx-auto" style={{ color: THEME.platinum }} />
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: THEME.stone }}>
                                        No tickets in database
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="flex items-center gap-4 px-4 py-3 rounded-lg border hover:bg-white/5 transition-colors"
                                                style={{ borderColor: THEME.border }}
                                            >
                                                {/* Status Badge */}
                                                <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${getStatusStyles(ticket.status)}`}>
                                                    {ticket.status}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm line-clamp-1" style={{ color: THEME.platinum }}>
                                                        {ticket.request_content}
                                                    </p>
                                                </div>

                                                {/* ID */}
                                                <div className="text-xs font-mono" style={{ color: THEME.stone }}>
                                                    {ticket.id.slice(0, 8)}
                                                </div>

                                                {/* Delete Button */}
                                                <Button
                                                    onClick={() => handleDeleteTicket(ticket.id)}
                                                    size="sm"
                                                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : null}

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-400">
                        Danger Zone
                    </h3>
                </div>

                <div className="space-y-3">
                    <p className="text-sm" style={{ color: THEME.stone }}>
                        Permanently delete all tickets from the database. This action cannot be undone and will remove:
                    </p>
                    <ul className="text-sm space-y-1 pl-6" style={{ color: THEME.stone }}>
                        <li className="list-disc">All ticket data and request content</li>
                        <li className="list-disc">AI analysis results and categorization</li>
                        <li className="list-disc">Draft responses and sentiment scores</li>
                        <li className="list-disc">All metadata and timestamps</li>
                    </ul>
                </div>

                <Button
                    onClick={handleDeleteAll}
                    disabled={isDeleting || (stats && stats.total_tickets === 0)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                    {isDeleting ? (
                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete All Tickets {stats && `(${stats.total_tickets})`}
                </Button>
            </div>
        </div>
    );
}

// Main Dashboard Component
export default function ProfessionalDashboard() {
    const [activeView, setActiveView] = useState('tickets');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

    const { data, error, isLoading, mutate } = useSWR<Ticket[]>(
        "/tickets",
        async () => {
            const response = await api.getTickets();
            return response.tickets;
        },
        { refreshInterval: 10000 }
    );

    const tickets = data || [];

    // Filtered tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const matchesSearch =
                searchQuery === "" ||
                ticket.request_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.draft_response?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tickets, searchQuery, statusFilter]);

    // Calculate metrics
    const stats = useMemo(() => {
        const total = tickets.length;
        const pending = tickets.filter((t) => t.status === "pending").length;
        const processing = tickets.filter((t) => t.status === "processing").length;
        const completed = tickets.filter((t) => t.status === "completed").length;

        return { total, pending, processing, completed };
    }, [tickets]);

    return (
        <div className="flex h-screen" style={{ background: THEME.background }}>
            {/* Sidebar */}
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="border-b sticky top-0 z-10" style={{ background: THEME.surface, borderColor: THEME.border }}>
                    <div className="px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold font-serif" style={{ color: THEME.platinumLight }}>
                                    {activeView === 'tickets' && 'Ticket Dashboard'}
                                    {activeView === 'analytics' && 'Analytics'}
                                    {activeView === 'database' && 'Database Management'}
                                    {activeView === 'settings' && 'Settings'}
                                </h1>
                                <p className="text-sm mt-1" style={{ color: THEME.stone }}>
                                    {activeView === 'tickets' && 'Manage your support operations'}
                                    {activeView === 'analytics' && 'Insights and performance metrics'}
                                    {activeView === 'database' && 'Monitor and maintain your data'}
                                    {activeView === 'settings' && 'Configure your dashboard'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeView === 'tickets' && (
                                    <Button
                                        onClick={() => mutate()}
                                        size="sm"
                                        className="bg-white/5 hover:bg-white/10 border"
                                        style={{ borderColor: THEME.border, color: THEME.platinum }}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                )}

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-400">Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {activeView === 'tickets' && (
                        <div className="space-y-6">
                            {/* Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard title="Total Tickets" value={stats.total} icon={TicketIcon} />
                                <MetricCard title="Pending" value={stats.pending} icon={Clock} trend="+12%" />
                                <MetricCard title="Processing" value={stats.processing} icon={Activity} />
                                <MetricCard title="Completed" value={stats.completed} icon={CheckCircle2} trend={`${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}%`} />
                            </div>

                            {/* Search & Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: THEME.stone }} />
                                    <input
                                        type="text"
                                        placeholder="Search tickets..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2"
                                        style={{
                                            background: THEME.surfaceElevated,
                                            borderColor: THEME.border,
                                            color: THEME.platinum,
                                        }}
                                    />
                                </div>

                                <div className="flex gap-2 bg-white/5 border rounded-lg p-1" style={{ borderColor: THEME.border }}>
                                    {(["all", "pending", "processing", "completed"] as const).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-all ${statusFilter === status
                                                ? 'bg-white/10 shadow-lg'
                                                : 'hover:bg-white/5'
                                                }`}
                                            style={{
                                                color: statusFilter === status ? THEME.platinumLight : THEME.stone,
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tickets List */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center space-y-4">
                                        <LoaderCircle className="h-12 w-12 animate-spin mx-auto" style={{ color: THEME.platinum }} />
                                        <p style={{ color: THEME.stone }}>Loading tickets...</p>
                                    </div>
                                </div>
                            ) : filteredTickets.length === 0 ? (
                                <div className="text-center py-20">
                                    <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: THEME.platinum }} />
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: THEME.platinumLight }}>
                                        {searchQuery || statusFilter !== "all" ? "No results found" : "All caught up!"}
                                    </h3>
                                    <p style={{ color: THEME.stone }}>
                                        {searchQuery || statusFilter !== "all"
                                            ? "Try adjusting your search or filters"
                                            : "No tickets to display"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} onUpdate={mutate} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'database' && <DatabasePanel />}
                    {activeView === 'settings' && <SettingsPanel />}

                    {activeView === 'analytics' && (
                        <div className="text-center py-20">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4" style={{ color: THEME.platinum }} />
                            <h3 className="text-xl font-semibold mb-2" style={{ color: THEME.platinumLight }}>
                                Analytics Dashboard
                            </h3>
                            <p style={{ color: THEME.stone }}>
                                Coming soon: Comprehensive analytics and insights
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
