import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardActivityCard(): React.JSX.Element {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Recent activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Activity feed will appear here after realtime dashboard widgets are
            connected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}