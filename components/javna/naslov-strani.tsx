export function NaslovStrani({
  naslov,
  opis,
}: {
  naslov: string;
  opis?: string;
}) {
  return (
    <div className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="display-lg text-balance">{naslov}</h1>
        {opis ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {opis}
          </p>
        ) : null}
      </div>
    </div>
  );
}
