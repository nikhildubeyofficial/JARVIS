import NotesClient from "@/components/notes-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-4xl min-h-screen">
      <Button asChild variant="ghost" className="mb-4 -ml-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assistant
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Notes</CardTitle>
          <CardDescription>
            Notes you've saved using the voice assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotesClient />
        </CardContent>
      </Card>
    </div>
  );
}
