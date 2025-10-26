"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LoanNote } from "@/types/loan-note";
import { toast } from "sonner";

interface NotesTabProps {
  loanId: string;
}

export function NotesTab({ loanId }: NotesTabProps) {
  const [notes, setNotes] = useState<LoanNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [loanId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/v1/loans/${loanId}/notes`);
      const result = await response.json();

      if (result.success) {
        setNotes(result.data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/loans/${loanId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newNote,
          createdBy: "Current User",
        }),
      });

      if (response.ok) {
        toast.success("Note added");
        setNewNote("");
        fetchNotes();
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const response = await fetch(`/api/v1/loans/${loanId}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Note deleted");
        fetchNotes();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newNote.trim()}
          >
            <Plus className="mr-2 size-4" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Note History ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center">
              <MessageSquare className="mb-2 size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{note.createdBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                        {note.updatedAt &&
                          new Date(note.updatedAt).getTime() !==
                            new Date(note.createdAt).getTime() && (
                            <span className="ml-2">(edited)</span>
                          )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

