"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleStop, LoaderCircle, Send } from "lucide-react";

import { dispatchCampaignBatchAction } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";

/**
 * Pošiljanje ene kampanje v serijah.
 *
 * Strežniška funkcija ne sme teči nekaj minut, zato ena zahteva pošlje samo
 * eno serijo, gumb pa jih veriži, dokler ni vrsta prazna ali dokler ni dosežena
 * dnevna omejitev. Napredek je zato viden sproti, prekinjena stran pa ne pomeni
 * izgubljene kampanje - vrsta ostane v bazi in se nadaljuje ob naslednjem kliku.
 */
export function CampaignDispatcher({
  campaignId,
  total,
  initialSent,
  initialFailed,
  initialPending,
  disabled,
}: {
  campaignId: string;
  total: number;
  initialSent: number;
  initialFailed: number;
  initialPending: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const stopRequested = useRef(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({
    sent: initialSent,
    failed: initialFailed,
    pending: initialPending,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processed = progress.sent + progress.failed;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  async function run() {
    stopRequested.current = false;
    setRunning(true);
    setError(null);
    setMessage(null);

    try {
      while (!stopRequested.current) {
        const result = await dispatchCampaignBatchAction(campaignId);

        setProgress((current) => ({
          sent: current.sent + result.sent,
          failed: current.failed + result.failed,
          pending: result.pending,
        }));
        setMessage(result.message);

        if (result.error) {
          setError(result.error);
          break;
        }

        // Serija brez poslanega sporočila pomeni konec, pavzo ali omejitev -
        // v vseh treh primerih bi nadaljevanje samo vrtelo prazne zahteve.
        if (
          result.done ||
          result.dailyLimitReached ||
          (result.sent === 0 && result.failed === 0)
        ) {
          break;
        }
      }
    } catch (cause) {
      console.error("Pošiljanje se je ustavilo", cause);
      setError("Pošiljanje se je ustavilo. Poskusi znova.");
    } finally {
      setRunning(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{progress.sent}</strong> poslanih
        </span>
        {progress.failed > 0 ? (
          <span className="text-destructive">
            <strong>{progress.failed}</strong> neuspešnih
          </span>
        ) : null}
        <span>
          <strong className="text-foreground">{progress.pending}</strong> v vrsti
        </span>
        <span>od skupno {total}</span>
      </div>

      {progress.pending > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                stopRequested.current = true;
              }}
            >
              <CircleStop className="size-4" />
              Ustavi po tej seriji
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={run} disabled={disabled}>
              <Send className="size-4" />
              {progress.sent > 0 ? "Nadaljuj pošiljanje" : "Začni pošiljanje"}
            </Button>
          )}

          {running ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Pošiljam - pusti zavihek odprt.
            </span>
          ) : null}
        </div>
      ) : null}

      {message && !error ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
