import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/components/toast-provider";

interface WebSocketMessage {
    type: string;
    data?: any;
    ticket?: any;
}

export function useTicketWebSocket(onMessage: (message: WebSocketMessage) => void) {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const { toast } = useToast();

    const connect = useCallback(() => {
        try {
            // Use wss if https, ws if http
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            // Support custom port for dev (localhost:8000), default api path
            // Assume API is proxied or absolute. Since we use Next.js, we might need env var.
            // For now, hardcode to backend localhost:8000 if in dev, or relative /api/ws.

            const wsUrl = "ws://localhost:8000/ws/tickets";

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setIsConnected(true);
                console.log("WebSocket Connected");
            };

            ws.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    onMessage(parsed);
                } catch (e) {
                    console.error("Failed to parse WS message", e);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                wsRef.current = null;
                // Reconnect after 3s
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error);
                ws.close();
            };

            wsRef.current = ws;
        } catch (error) {
            console.error("WebSocket Connection Failed:", error);
        }
    }, [onMessage]);

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return { isConnected };
}
