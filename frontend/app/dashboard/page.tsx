"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Ticket, TicketStatus } from "@/lib/types";
import {
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    Clock,
    CheckCircle2,
    Sparkles,
    FileText,
    Activity,
    DollarSign,
    Wrench,
    Zap,
    Save,
    X,
    Search,
    TrendingUp,
    BarChart3,
    LoaderCircle,
    Filter,
    Command,
    Layers,
    Users,
    Zap as Lightning,
    Brain
} from "lucide-react";
import { useToast } from "@/components/toast-provider";

// Status Styling with glassmorphism
const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
        case "pending":
            return "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20";
        case "processing":
            return "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/20 animate-pulse";
        case "completed":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20";
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

// Glassmorphic Metric Card Component
function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    gradient,
    delay = 0
}: {
    title: string;
    value: number | string;
    icon: any;
    trend?: string;
    gradient: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/40 via-stone-900/20 to-stone-900/40 backdrop-blur-xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} style={{ mixBlendMode: 'overlay' }} />

            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    {trend && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                            <TrendingUp className="h-3 w-3" />
                            {trend}
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <motion.div
                        className="text-4xl font-bold bg-gradient-to-br from-white to-stone-400 bg-clip-text text-transparent"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
                    >
                        {value}
                    </motion.div>
                    <div className="text-sm text-stone-400 font-medium">{title}</div>
                </div>
            </div>
        </motion.div>
    );
}

// Enhanced Ticket Card with Glassmorphism
function GlassmorphicTicketCard({ ticket, onUpdate }: { ticket: Ticket; onUpdate: () => void }) {
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-stone-900/60 via-stone-900/40 to-stone-900/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {/* Header */}
                <div
                    onClick={() => setExpanded(!expanded)}
                    className="px-5 py-4 cursor-pointer flex items-center gap-4"
                >
                    {/* Status Badge */}
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${getStatusStyles(ticket.status)} shadow-lg`}>
                        {ticket.status}
                    </div>

                    {/* Category */}
                    {ticket.category && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-[10px] text-stone-300">
                            {ticket.category === "Billing" && <DollarSign className="h-3 w-3" />}
                            {ticket.category === "Technical" && <Wrench className="h-3 w-3" />}
                            {ticket.category === "Feature" && <Zap className="h-3 w-3" />}
                            {ticket.category === "Other" && <FileText className="h-3 w-3" />}
                            <span className="font-semibold">{ticket.category}</span>
                        </div>
                    )}

                    {/* Urgency */}
                    {ticket.urgency && (
                        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border backdrop-blur-sm ${getUrgencyStyles(ticket.urgency)} shadow-lg`}>
                            {ticket.urgency}
                        </div>
                    )}

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-200 line-clamp-1 font-medium">
                            {ticket.request_content}
                        </p>
                    </div>

                    {/* Sentiment Badge */}
                    {ticket.sentiment_score !== undefined && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30">
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            <span className="text-xs font-bold text-purple-300">
                                {ticket.sentiment_score.toFixed(1)}
                            </span>
                        </div>
                    )}

                    {/* Expand Icon */}
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden border-t border-white/5"
                        >
                            <div className="px-5 py-6 space-y-6 bg-gradient-to-b from-black/20 to-transparent">
                                {/* Full Request */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                                        <FileText className="h-3.5 w-3.5" />
                                        Request
                                    </div>
                                    <p className="text-sm text-stone-300 leading-relaxed pl-5">
                                        {ticket.request_content}
                                    </p>
                                </div>

                                {/* AI Draft Response */}
                                {ticket.draft_response && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                                <Brain className="h-3.5 w-3.5" />
                                                AI Draft Response
                                            </div>
                                            {!isEditing && (
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs bg-white/5 hover:bg-white/10 border border-white/10"
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
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm min-h-[120px] resize-none"
                                                    placeholder="Edit AI response..."
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleSaveDraft}
                                                        disabled={isSaving}
                                                        size="sm"
                                                        className="h-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
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
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 bg-white/5 hover:bg-white/10"
                                                    >
                                                        <X className="h-3.5 w-3.5 mr-1.5" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-stone-300 leading-relaxed pl-5 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg p-4">
                                                {ticket.draft_response}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="flex items-center gap-6 text-xs text-stone-500 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                    </div>
                                    <div className="flex items-center gap-2 font-mono">
                                        <span className="text-stone-600">ID:</span>
                                        <span className="text-stone-400">{ticket.id.slice(0, 8)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {ticket.status !== "completed" && (
                                    <div className="pt-2">
                                        <Button
                                            onClick={handleResolve}
                                            disabled={isSaving}
                                            className="w-full h-10 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
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
            </div>
        </motion.div>
    );
}

export default function AdvancedDashboardPage() {
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
        const avgSentiment =
            tickets.reduce((sum, t) => sum + (t.sentiment_score || 0), 0) / (tickets.length || 1);

        return { total, pending, processing, completed, avgSentiment };
    }, [tickets]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-stone-950 to-stone-900">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50"
                >
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 border border-white/10">
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                                        Agent Dashboard
                                    </h1>
                                    <p className="text-xs text-stone-500 mt-0.5">Powered by AI Intelligence</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => mutate()}
                                    variant="ghost"
                                    size="sm"
                                    className="bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                </Button>

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
                </motion.div>

                {/* Main Content */}
                <div className="container mx-auto px-6 py-8 space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Tickets"
                            value={stats.total}
                            icon={Layers}
                            gradient="from-purple-600 to-purple-700"
                            delay={0}
                        />
                        <MetricCard
                            title="Pending"
                            value={stats.pending}
                            icon={Clock}
                            gradient="from-amber-600 to-orange-600"
                            trend="+12%"
                            delay={0.1}
                        />
                        <MetricCard
                            title="Processing"
                            value={stats.processing}
                            icon={Lightning}
                            gradient="from-blue-600 to-cyan-600"
                            delay={0.2}
                        />
                        <MetricCard
                            title="Completed"
                            value={stats.completed}
                            icon={CheckCircle2}
                            gradient="from-emerald-600 to-green-600"
                            trend={`${((stats.completed / stats.total) * 100).toFixed(0)}%`}
                            delay={0.3}
                        />
                    </div>

                    {/* Search & Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2 bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-1">
                            {(["all", "pending", "processing", "completed"] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${statusFilter === status
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                                        : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tickets List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center space-y-4">
                                    <LoaderCircle className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
                                    <p className="text-stone-400">Loading tickets...</p>
                                </div>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4">
                                    <Sparkles className="h-8 w-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-stone-300 mb-2">
                                    {searchQuery || statusFilter !== "all" ? "No results found" : "All caught up!"}
                                </h3>
                                <p className="text-stone-500">
                                    {searchQuery || statusFilter !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "No tickets to display at the moment"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredTickets.map((ticket) => (
                                        <GlassmorphicTicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            onUpdate={mutate}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>

                    {/* Footer Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 pt-8 border-t border-white/5"
                    >
                        <div className="flex items-center justify-between text-xs text-stone-500">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2">
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    Dashboard v2.0
                                </span>
                                <span className="flex items-center gap-2">
                                    <Activity className="h-3.5 w-3.5 text-purple-500" />
                                    Avg Sentiment: <span className="text-purple-400 font-semibold">{stats.avgSentiment.toFixed(1)}/10</span>
                                </span>
                                <span>Auto-refresh: 10s</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-500">●</span>
                                <span>Live</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
