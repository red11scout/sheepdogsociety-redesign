"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

type Note = {
  id: string;
  reference: string;
  content: string;
  createdAt: string;
};

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => setNotes(data.notes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl bg-background p-6 text-foreground">
      <header className="mb-6">
        <p className="section-mark">In the margins</p>
        <h1 className="display-soft mt-2 text-3xl text-foreground">My Notes</h1>
        <div className="hairline mt-4 text-foreground" />
      </header>
      {loading ? (
        <p className="font-serif text-base italic text-muted-foreground">
          Loading...
        </p>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="font-serif text-base leading-relaxed text-muted-foreground">
              No notes yet. Add notes from the Bible reader.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <CardTitle className="section-mark">{note.reference}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground/90">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
