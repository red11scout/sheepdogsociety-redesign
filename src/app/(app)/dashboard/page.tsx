export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth-compat";
import { db } from "@/db";
import { users, scriptureOfDay, devotionals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, Shield } from "lucide-react";

export default async function HomePage() {
  // Layout already verified auth + active status
  const { userId } = await auth();

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId!));

  const today = format(new Date(), "yyyy-MM-dd");

  const [todayScripture] = await db
    .select()
    .from(scriptureOfDay)
    .where(eq(scriptureOfDay.date, today));

  const [todayDevotional] = await db
    .select()
    .from(devotionals)
    .where(eq(devotionals.date, today));

  return (
    <div className="mx-auto max-w-4xl space-y-6 bg-background p-6 text-foreground">
      <header>
        <div className="flex items-center gap-4">
          <span className="folio">The day&rsquo;s watch</span>
          <div className="hairline flex-1 text-foreground" />
          <span className="folio">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
        </div>
        <h1 className="display-soft mt-5 text-[clamp(1.9rem,4.5vw,2.6rem)] text-foreground">
          Welcome back, {currentUser.firstName || "brother"}.
        </h1>
      </header>

      {todayScripture && (
        <Card>
          <CardHeader>
            <CardTitle className="section-mark flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brass" />
              Scripture of the Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-pullquote text-xl italic leading-snug text-foreground md:text-2xl">
              &ldquo;{todayScripture.text}&rdquo;
            </p>
            <p className="folio mt-3 !text-brass">
              — {todayScripture.reference} ({todayScripture.translation})
            </p>
            {todayScripture.reflection && (
              <p className="mt-4 border-l border-foreground/15 pl-4 font-serif text-base leading-relaxed text-muted-foreground">
                {todayScripture.reflection}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {todayDevotional && (
        <Card>
          <CardHeader>
            <p className="section-mark flex items-center gap-2">
              <Heart className="h-4 w-4 text-brass" />
              The devotional
            </p>
            <CardTitle className="display-soft mt-2 text-2xl text-foreground">
              {todayDevotional.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line font-serif text-base leading-relaxed text-foreground/90">
              {todayDevotional.content}
            </p>
            {todayDevotional.prayerPrompt && (
              <div className="mt-5 border-l-2 border-brass/60 pl-4">
                <p className="section-mark">Prayer</p>
                <p className="mt-2 font-serif text-base leading-relaxed text-muted-foreground">
                  {todayDevotional.prayerPrompt}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!todayScripture && !todayDevotional && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Shield className="h-12 w-12 text-brass" />
            <h2 className="display-soft text-2xl text-foreground">
              Sheepdog Society
            </h2>
            <p className="font-serif text-base leading-relaxed text-muted-foreground">
              Iron sharpens iron. Stand guard. Walk in faith.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
