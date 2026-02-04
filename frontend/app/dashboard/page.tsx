"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Ticket, TicketStatus } from "@/lib/types";
import {
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Clock,
    CheckCircle2,
    Sparkles,
    FileText,
    Activity,
    Filter,
    MoreHorizontal
} from "lucide-react";
import { useToast } from "@/components/toast-provider";

// --- Theme Utilities ---

const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
        case "pending":
            return "bg-amber-900/20 text-amber-200 border-amber-900/50"; // Bronze
        case "processing":
            return "bg-stone-800 text-stone-200 border-stone-600"; // Silver
        case "completed":
            return "bg-emerald-900/20 text-emerald-200 border-emerald-900/50"; // Platinum/Jade
        case "failed":
            return "bg-red-900/20 text-red-300 border-red-900/50";
        default:
            return "bg-stone-800 text-stone-400 border-stone-700";
    }
};

function TicketRow({ ticket }: { ticket: Ticket }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="group border-b border-stone-800/50 last:border-0 transition-all duration-300 hover:bg-[#1C1917]">
            <div
                className="p-6 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-6">
                    {/* ID & Status Column */}
                    <div className="w-24 flex-shrink-0 flex flex-col gap-2">
                        <span className="font-mono text-[10px] text-stone-600 uppercase tracking-widest">
                            {ticket.id.slice(0, 6)}
                        </span>
                        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border w-fit ${getStatusStyles(ticket.status)}`}>
                            {ticket.status}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#FAFAF9] line-clamp-2 mb-2 leading-relaxed group-hover:text-white transition-colors">
                            {ticket.request_content}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-stone-500">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                            </div>
                            {ticket.sentiment_score && (
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Score: {ticket.sentiment_score}/10</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Icon */}
                    <button
                        className={`text-stone-600 hover:text-stone-300 transition-all duration-300 transform ${expanded ? 'rotate-180' : ''}`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Details Pane */}
            {expanded && (
                <div className="px-6 pb-8 pt-2 bg-[#0C0A09]/50 animate-slide-down border-t border-stone-800/30">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left: Full Request */}
                        <div>
                            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                Request Data
                            </h4>
                            <div className="bg-[#0C0A09] rounded p-4 border border-stone-800/50">
                                <p className="text-sm text-stone-300 whitespace-pre-wrap leading-relaxed font-light">
                                    {ticket.request_content}
                                </p>
                            </div>
                        </div>

                        {/* Right: AI Analysis */}
                        <div className="space-y-6">
                            {ticket.sentiment_score && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Activity className="h-3 w-3" />
                                        Sentiment Analysis
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-1 bg-stone-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-stone-400 transition-all duration-500"
                                                style={{ width: `${ticket.sentiment_score * 10}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-[#FAFAF9]">{ticket.sentiment_score}/10</span>
                                    </div>
                                </div>
                            )}

                            {ticket.draft_response && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-stone-400" />
                                        AI Draft
                                    </h4>
                                    <div className="p-4 rounded bg-stone-900/30 border border-stone-800 italic text-sm text-stone-400 leading-relaxed">
                                        &ldquo;{ticket.draft_response}&rdquo;
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

    const { data, error, isLoading, mutate } = useSWR(
        statusFilter === "all" ? "/tickets" : `/tickets?status=${statusFilter}`,
        () => api.getTickets(statusFilter !== "all" ? { status_filter: statusFilter } : undefined),
        {
            refreshInterval: 3000,
            revalidateOnFocus: true,
            onError: () => toast("Sync failed", "error"),
        }
    );

    const tickets = data?.tickets || [];
    const total = data?.total || 0;
    const stats = {
        pending: tickets.filter((t) => t.status === "pending").length,
        processing: tickets.filter((t) => t.status === "processing").length,
        completed: tickets.filter((t) => t.status === "completed").length,
    };

    const handleRefresh = () => {
        mutate();
        toast("Dashboard synced", "info");
    };

    return (
        <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9]">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="container relative mx-auto px-5 md:px-6 py-12 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 animate-slide-down">
                    <div>
                        <Link href="/">
                            <div className="flex items-center gap-2 text-stone-500 hover:text-[#FAFAF9] transition-colors mb-4 text-xs font-bold uppercase tracking-widest cursor-pointer">
                                <ArrowLeft className="h-3 w-3" />
                                Return Home
                            </div>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#FAFAF9] tracking-tight mb-2">
                            Command Center
                        </h1>
                        <p className="text-stone-500 font-light text-lg">
                            Live telemetry and ticket intelligence.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="border-stone-800 text-stone-400 hover:text-[#FAFAF9] hover:bg-stone-900 bg-transparent"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Sync Data
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-slide-up">
                    {/* Total */}
                    <div
                        onClick={() => setStatusFilter("all")}
                        className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${statusFilter === 'all' ? 'bg-stone-900 border-stone-600' : 'bg-[#141210] border-stone-800 hover:border-stone-700'}`}
                    >
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Total Tickets</p>
                        <p className="text-4xl font-serif font-medium text-[#FAFAF9]">{total}</p>
                    </div>

                    {/* Pending (Bronze) */}
                    <div
                        onClick={() => setStatusFilter("pending")}
                        className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-950/20 border-amber-900/50' : 'bg-[#141210] border-stone-800 hover:border-amber-900/30'}`}
                    >
                        <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-bold mb-2">Pending</p>
                        <p className="text-4xl font-serif font-medium text-amber-200">{stats.pending}</p>
                    </div>

                    {/* Processing (Silver) */}
                    <div
                        onClick={() => setStatusFilter("processing")}
                        className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${statusFilter === 'processing' ? 'bg-stone-800 border-stone-500' : 'bg-[#141210] border-stone-800 hover:border-stone-600'}`}
                    >
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Processing</p>
                        <p className="text-4xl font-serif font-medium text-stone-200">{stats.processing}</p>
                    </div>

                    {/* Completed (Platinum) */}
                    <div
                        onClick={() => setStatusFilter("completed")}
                        className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${statusFilter === 'completed' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-[#141210] border-stone-800 hover:border-emerald-900/30'}`}
                    >
                        <p className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold mb-2">Resolved</p>
                        <p className="text-4xl font-serif font-medium text-emerald-100">{stats.completed}</p>
                    </div>
                </div>

                {/* Main Table Area */}
                <div className="border border-stone-800 rounded-xl overflow-hidden bg-[#141210] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {/* Toolbar */}
                    <div className="p-4 border-b border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-stone-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                {statusFilter === 'all' ? 'All Records' : `${statusFilter} Records`}
                            </span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-600">
                            {tickets.length} items
                        </div>
                    </div>

                    {/* List */}
                    <div>
                        {isLoading && tickets.length === 0 ? (
                            <DashboardSkeleton />
                        ) : error ? (
                            <div className="p-12 text-center text-stone-500">
                                <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
                                <p>Data synchronization failed.</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-6">
                                    <FileText className="h-6 w-6 text-stone-600" />
                                </div>
                                <h3 className="text-lg font-bold text-[#FAFAF9] mb-2">System Empty</h3>
                                <p className="text-stone-500 mb-8 max-w-xs mx-auto">No tickets match the current parameters.</p>
                                <Link href="/submit">
                                    <Button variant="outline" className="border-stone-700 text-stone-300 hover:text-white">
                                        Initialize Request
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div>
                                {tickets.map((ticket) => (
                                    <TicketRow key={ticket.id} ticket={ticket} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
