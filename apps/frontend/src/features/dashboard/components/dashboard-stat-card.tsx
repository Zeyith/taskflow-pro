import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardStatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  isLoading: boolean;
};

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: DashboardStatCardProps): React.JSX.Element {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-foreground">
            {title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-9 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}