"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";

export type Note = {
  id: string;
  content: string;
  createdAt: string;
};

export default function NotesClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("cognito-notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("cognito-notes", JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (newNote.trim() === "") return;
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    setNewNote("");
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    saveNotes(updatedNotes);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Type a new note..."
          className="bg-background"
        />
        <Button onClick={handleAddNote}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            You have no notes yet.
          </p>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="bg-secondary">
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap">{note.content}</p>
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center text-sm text-muted-foreground">
                <span>{new Date(note.createdAt).toLocaleString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  <span className="sr-only">Delete note</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
