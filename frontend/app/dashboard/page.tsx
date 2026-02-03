"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Filter
} from "lucide-react";
import { useToast } from "@/components/toast-provider";

const getStatusBadge = (status: TicketStatus) => {
    const config = {
        pending: { variant: "warning" as const, label: "Pending" },
        processing: { variant: "info" as const, label: "Processing" },
        completed: { variant: "success" as const, label: "Completed" },
        failed: { variant: "destructive" as const, label: "Failed" },
    };

    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
};

const getUrgencyBadge = (urgency?: string) => {
    if (!urgency) return null;
    const variant = urgency === "High" ? "destructive"
        : urgency === "Medium" ? "warning"
            : "success";
    return <Badge variant={variant as any}>{urgency}</Badge>;
};

const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    return <Badge variant="outline" className="border-slate-600 text-slate-300">{category}</Badge>;
};

function TicketRow({ ticket }: { ticket: Ticket }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-b border-slate-700/50 last:border-0 transition-all duration-200 hover:bg-white/5">
            <div
                className="p-6 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-3 py-1 rounded-md border border-slate-700">
                                {ticket.id.slice(0, 8)}
                            </span>
                            {getStatusBadge(ticket.status)}
                            {ticket.urgency && getUrgencyBadge(ticket.urgency)}
                            {ticket.category && getCategoryBadge(ticket.category)}
                        </div>

                        <p className="text-sm text-slate-200 line-clamp-2 mb-3 font-medium leading-relaxed">
                            {ticket.request_content}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                            </div>
                            {ticket.sentiment_score && (
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>Sentiment: {ticket.sentiment_score}/10</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="text-slate-400 hover:text-blue-400 transition-all duration-200 flex-shrink-0 p-2 hover:bg-blue-500/10 rounded-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        aria-label={expanded ? "Collapse details" : "Expand details"}
                    >
                        {expanded ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="px-6 pb-6 glass-dark border-t border-slate-700/50 animate-slide-down">
                    <div className="space-y-5 pt-5">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-400" />
                                Full Request
                            </h4>
                            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {ticket.request_content}
                                </p>
                            </div>
                        </div>

                        {ticket.sentiment_score && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-violet-400" />
                                    Sentiment Analysis
                                </h4>
                                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-slate-800 rounded-full h-3 max-w-md overflow-hidden">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${ticket.sentiment_score >= 7
                                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                                    : ticket.sentiment_score >= 4
                                                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                                        : "bg-gradient-to-r from-red-500 to-red-600"
                                                    }`}
                                                style={{ width: `${ticket.sentiment_score * 10}%` }}
                                            />
                                        </div>
                                        <span className="text-lg font-bold text-white min-w-[80px]">
                                            {ticket.sentiment_score}/10
                                            <span className="ml-2 text-2xl">
                                                {ticket.sentiment_score >= 7 ? "😊" : ticket.sentiment_score >= 4 ? "😐" : "😞"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {ticket.draft_response && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-400" />
                                    AI-Generated Draft Response
                                </h4>
                                <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-lg p-5 backdrop-blur-sm">
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {ticket.draft_response}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 text-xs text-slate-500 border-t border-slate-700/50">
                            <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">ID: {ticket.id}</span>
                            {ticket.status === "completed" && (
                                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Processing completed
                                </span>
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
            revalidateOnReconnect: true,
            onError: () => {
                toast("Failed to load tickets. Check your connection.", "error");
            },
        }
    );

    const tickets = data?.tickets || [];
    const total = data?.total || 0;

    const statusCounts = {
        pending: tickets.filter((t) => t.status === "pending").length,
        processing: tickets.filter((t) => t.status === "processing").length,
        completed: tickets.filter((t) => t.status === "completed").length,
        failed: tickets.filter((t) => t.status === "failed").length,
    };

    const handleRefresh = () => {
        mutate();
        toast("Dashboard refreshed", "info", 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-white opacity-10" />

            <div className="container relative mx-auto px-5 md:px-4 py-8 md:py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between animate-slide-down">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Page Title */}
                    <div className="mb-10 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-sm">
                            <Activity className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-300">Real-Time Monitoring</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                            Ticket Dashboard
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-lg text-slate-300">
                                Live monitoring with automatic updates every 3 seconds
                            </p>
                            <div className="flex items-center gap-2 px-3 py-1.5 glass-dark border border-emerald-500/30 rounded-full">
                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold text-emerald-300">LIVE</span>
                            </div>
                        </div>
                    </div>

                    {isLoading && tickets.length === 0 ? (
                        <DashboardSkeleton />
                    ) : (
                        <>
                            {/* Status Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <Card
                                    className={`cursor-pointer transition-all duration-300 border-2 hover-lift ${statusFilter === "all"
                                        ? "ring-4 ring-blue-500/30 border-blue-500 glass-dark glow-blue-subtle"
                                        : "glass-dark border-slate-700/50 hover:border-blue-500/50"
                                        }`}
                                    onClick={() => setStatusFilter("all")}
                                >
                                    <CardHeader className="pb-2 md:pb-3">
                                        <p className="text-xs font-semibold uppercase text-slate-400">Total</p>
                                        <CardTitle className="text-4xl md:text-5xl font-bold text-white">{total}</CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-all duration-300 border-2 hover-lift ${statusFilter === "pending"
                                        ? "ring-4 ring-amber-500/30 border-amber-500 glass-dark"
                                        : "glass-dark border-slate-700/50 hover:border-amber-500/50"
                                        }`}
                                    onClick={() => setStatusFilter("pending")}
                                >
                                    <CardHeader className="pb-2 md:pb-3">
                                        <p className="text-xs font-semibold uppercase text-slate-400">Pending</p>
                                        <CardTitle className="text-4xl md:text-5xl font-bold text-amber-400">
                                            {statusCounts.pending}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-all duration-300 border-2 hover-lift ${statusFilter === "processing"
                                        ? "ring-4 ring-blue-500/30 border-blue-500 glass-dark"
                                        : "glass-dark border-slate-700/50 hover:border-blue-500/50"
                                        }`}
                                    onClick={() => setStatusFilter("processing")}
                                >
                                    <CardHeader className="pb-2 md:pb-3">
                                        <p className="text-xs font-semibold uppercase text-slate-400">Processing</p>
                                        <CardTitle className="text-4xl md:text-5xl font-bold text-blue-400">
                                            {statusCounts.processing}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-all duration-300 border-2 hover-lift ${statusFilter === "completed"
                                        ? "ring-4 ring-emerald-500/30 border-emerald-500 glass-dark"
                                        : "glass-dark border-slate-700/50 hover:border-emerald-500/50"
                                        }`}
                                    onClick={() => setStatusFilter("completed")}
                                >
                                    <CardHeader className="pb-2 md:pb-3">
                                        <p className="text-xs font-semibold uppercase text-slate-400">Completed</p>
                                        <CardTitle className="text-4xl md:text-5xl font-bold text-emerald-400">
                                            {statusCounts.completed}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Tickets List */}
                            <div className="glass-dark border-2 border-slate-700/50 rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 border-b border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                                <Filter className="h-6 w-6 text-blue-400" />
                                                {statusFilter === "all"
                                                    ? "All Tickets"
                                                    : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Tickets`
                                                }
                                            </h2>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Showing {tickets.length} of {total} total tickets
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {error && (
                                        <div className="p-10 flex items-center gap-4 text-red-400 bg-red-500/10 border-b-4 border-red-500/30">
                                            <AlertCircle className="h-8 w-8 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-lg">Failed to load tickets</p>
                                                <p className="text-sm text-red-300 mt-1">Please check your backend connection and try again.</p>
                                            </div>
                                        </div>
                                    )}

                                    {!error && tickets.length === 0 && (
                                        <div className="p-20 text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                                <FileText className="h-12 w-12 text-blue-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">No tickets found</h3>
                                            <p className="text-slate-400 mb-8 text-lg">Get started by creating your first support ticket</p>
                                            <Link href="/submit">
                                                <Button size="xl" className="glow-blue-subtle hover-glow bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700">
                                                    <Sparkles className="mr-2 h-5 w-5" />
                                                    Create Your First Ticket
                                                </Button>
                                            </Link>
                                        </div>
                                    )}

                                    {tickets.length > 0 && (
                                        <div>
                                            {tickets.map((ticket) => (
                                                <TicketRow key={ticket.id} ticket={ticket} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
