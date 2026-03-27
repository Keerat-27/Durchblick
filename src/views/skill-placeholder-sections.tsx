import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PlaceholderProps = {
  titleDe: string;
  titleEn: string;
  body: string;
  accentClass?: string;
};

function SkillPlaceholder({
  titleDe,
  titleEn,
  body,
  accentClass = 'text-primary',
}: PlaceholderProps) {
  return (
    <Card className="app-reveal app-skill-card bg-card/90 backdrop-blur-sm dark:bg-card/80">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="font-heading text-2xl tracking-tight md:text-3xl">
          <span className={accentClass}>{titleDe}</span>
          <span className="mt-1 block font-sans text-base font-normal text-muted-foreground">
            {titleEn}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {body}
        </p>
      </CardContent>
    </Card>
  );
}

export function LesenSection() {
  return (
    <SkillPlaceholder
      titleDe="Lesen"
      titleEn="Reading"
      accentClass="text-[var(--chart-2)]"
      body="Hier kommen bald Texte, Verständnisfragen und Wortschatzübungen zum Lesen. Du kannst später Artikel, Kurzgeschichten und Prüfungsaufgaben einbinden."
    />
  );
}

export function HoerenSection() {
  return (
    <SkillPlaceholder
      titleDe="Hören"
      titleEn="Listening"
      accentClass="text-[var(--chart-4)]"
      body="Hier kommen bald Audiodateien, Diktate und Hörverständnisaufgaben. Später kannst du Clips nach Niveau gruppieren und Transkripte anbieten."
    />
  );
}

export function SprechenSection() {
  return (
    <SkillPlaceholder
      titleDe="Sprechen"
      titleEn="Speaking"
      accentClass="text-[var(--chart-3)]"
      body="Hier kommen bald Aufgaben zum freien Sprechen, Aussprache und mündlichen Prüfungssimulationen. Aufnahme- oder Dialogübungen lassen sich später ergänzen."
    />
  );
}
