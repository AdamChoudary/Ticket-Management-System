"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Ticket, TicketStatus, TicketCategory } from "@/lib/types";
import { ArrowLeft, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// Status badge styling
const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
        case "pending":
            return <Badge variant="warning">Pending</Badge>;
        case "processing":
            return <Badge variant="info">Processing</Badge>;
        case "completed":
            return <Badge variant="success">Completed</Badge>;
        case "failed":
            return <Badge variant="destructive">Failed</Badge>;
    }
};

// Urgency badge styling
const getUrgencyBadge = (urgency?: string) => {
    if (!urgency) return null;

    switch (urgency) {
        case "High":
            return <Badge variant="destructive">High</Badge>;
        case "Medium":
            return <Badge variant="warning">Medium</Badge>;
        case "Low":
            return <Badge variant="success">Low</Badge>;
    }
};

// Category badge styling
const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    return <Badge variant="outline">{category}</Badge>;
};

// Ticket row component
function TicketRow({ ticket }: { ticket: Ticket }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-0">
            <div
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-gray-500">
                                {ticket.id.slice(0, 8)}...
                            </span>
                            {getStatusBadge(ticket.status)}
                            {ticket.urgency && getUrgencyBadge(ticket.urgency)}
                            {ticket.category && getCategoryBadge(ticket.category)}
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2">
                            {ticket.request_content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </p>
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
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
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-3 pt-3">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                                Full Request
                            </h4>
                            <p className="text-sm text-gray-900">{ticket.request_content}</p>
                        </div>

                        {ticket.sentiment_score && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                                    Sentiment Score
                                </h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${ticket.sentiment_score >= 7
                                                    ? "bg-green-500"
                                                    : ticket.sentiment_score >= 4
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                }`}
                                            style={{ width: `${ticket.sentiment_score * 10}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {ticket.sentiment_score}/10
                                    </span>
                                </div>
                            </div>
                        )}

                        {ticket.draft_response && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                                    AI Draft Response
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-md p-3">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {ticket.draft_response}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <span className="text-xs text-gray-500">
                                Ticket ID: {ticket.id}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

    // Fetch tickets with SWR - automatically refetches every 3 seconds
    const { data, error, isLoading, mutate } = useSWR(
        statusFilter === "all" ? "/tickets" : `/tickets?status=${statusFilter}`,
        () => api.getTickets(statusFilter !== "all" ? { status_filter: statusFilter } : undefined),
        {
            refreshInterval: 3000, // Poll every 3 seconds for real-time updates
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    const tickets = data?.tickets || [];
    const total = data?.total || 0;

    // Count tickets by status
    const statusCounts = {
        pending: tickets.filter((t) => t.status === "pending").length,
        processing: tickets.filter((t) => t.status === "processing").length,
        completed: tickets.filter((t) => t.status === "completed").length,
        failed: tickets.filter((t) => t.status === "failed").length,
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mutate()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Ticket Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Real-time monitoring of all support tickets (auto-refreshes every 3 seconds)
                    </p>
                </div>

                {/* Status Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card
                        className={`cursor-pointer transition-all ${statusFilter === "all" ? "ring-2 ring-blue-500" : ""
                            }`}
                        onClick={() => setStatusFilter("all")}
                    >
                        <CardHeader className="pb-2">
                            <CardDescription>Total Tickets</CardDescription>
                            <CardTitle className="text-3xl">{total}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${statusFilter === "pending" ? "ring-2 ring-yellow-500" : ""
                            }`}
                        onClick={() => setStatusFilter("pending")}
                    >
                        <CardHeader className="pb-2">
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-3xl text-yellow-600">
                                {statusCounts.pending}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${statusFilter === "processing" ? "ring-2 ring-blue-500" : ""
                            }`}
                        onClick={() => setStatusFilter("processing")}
                    >
                        <CardHeader className="pb-2">
                            <CardDescription>Processing</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">
                                {statusCounts.processing}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${statusFilter === "completed" ? "ring-2 ring-green-500" : ""
                            }`}
                        onClick={() => setStatusFilter("completed")}
                    >
                        <CardHeader className="pb-2">
                            <CardDescription>Completed</CardDescription>
                            <CardTitle className="text-3xl text-green-600">
                                {statusCounts.completed}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Tickets List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {statusFilter === "all" ? "All Tickets" : `${statusFilter} Tickets`}
                                </CardTitle>
                                <CardDescription>
                                    Showing {tickets.length} of {total} tickets
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-gray-500">Live</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {error && (
                            <div className="p-6 flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <p>Failed to load tickets. Please check your backend connection.</p>
                            </div>
                        )}

                        {isLoading && tickets.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p>Loading tickets...</p>
                            </div>
                        )}

                        {!isLoading && tickets.length === 0 && !error && (
                            <div className="p-12 text-center text-gray-500">
                                <p className="mb-4">No tickets found</p>
                                <Link href="/submit">
                                    <Button>Create Your First Ticket</Button>
                                </Link>
                            </div>
                        )}

                        {tickets.length > 0 && (
                            <div className="divide-y divide-gray-200">
                                {tickets.map((ticket) => (
                                    <TicketRow key={ticket.id} ticket={ticket} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        Dashboard automatically refreshes every 3 seconds to show real-time updates
                    </p>
                </div>
            </div>
        </main>
    );
}
