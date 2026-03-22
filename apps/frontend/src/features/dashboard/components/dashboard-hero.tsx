import { Card, CardContent } from '@/components/ui/card';

export function DashboardHero(): React.JSX.Element {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-7">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          Operations overview
        </div>

        <div className="mt-5 space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Monitor projects, tasks, notifications, and incident workflow from
            one centralized enterprise workspace.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}