import { RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardStatusCardProps = {
  hasSummaryError: boolean;
  onRetrySummary: () => void;
};

export function DashboardStatusCard({
  hasSummaryError,
  onRetrySummary,
}: DashboardStatusCardProps): React.JSX.Element {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Workspace state</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Connected
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Realtime foundation</p>
          <p className="mt-1 text-sm font-semibold text-foreground">Ready</p>
        </div>

        {hasSummaryError ? (
          <Button variant="outline" className="w-full" onClick={onRetrySummary}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry summary
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}