import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Support Hub
          </h1>
          <p className="text-xl text-gray-600">
            Intelligent ticket triage with real-time AI processing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Ticket</CardTitle>
              <CardDescription>
                Create a support ticket and get instant acknowledgment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/submit">
                <Button className="w-full">Create New Ticket</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Dashboard</CardTitle>
              <CardDescription>
                Monitor all tickets with real-time status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">Open Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ol className="list-decimal list-inside space-y-2">
              <li>Submit your support request via the form</li>
              <li>Receive instant acknowledgment (< 100ms response)</li>
              <li>AI analyzes your ticket in the background (3-5 seconds)</li>
              <li>View real-time status updates on the dashboard</li>
              <li>Get AI-categorized tickets with draft responses</li>
            </ol>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Built with FastAPI, Next.js, PostgreSQL, Redis, and Celery
          </p>
        </div>
      </div>
    </main>
  );
}
