import { RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PresenceMember = {
  userId: string;
  fullName: string;
  role: string;
  status: string;
  focusedTaskTitle: string | null;
};

type PresenceProject = {
  id: string;
  name: string;
};

type DashboardPresenceCardProps = {
  isProjectsLoading: boolean;
  isProjectsError: boolean;
  isPresenceLoading: boolean;
  isPresenceError: boolean;
  defaultProject: PresenceProject | null;
  onlineUsers: PresenceMember[];
  focusedUsersCount: number;
  onRetryPresence: () => void;
};

export function DashboardPresenceCard({
  isProjectsLoading,
  isProjectsError,
  isPresenceLoading,
  isPresenceError,
  defaultProject,
  onlineUsers,
  focusedUsersCount,
  onRetryPresence,
}: DashboardPresenceCardProps): React.JSX.Element {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Presence snapshot
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isProjectsLoading || isPresenceLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : null}

        {isProjectsError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              Failed to load projects for presence preview.
            </p>
          </div>
        ) : null}

        {!isProjectsLoading && !isProjectsError && !defaultProject ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No accessible active project found for presence preview.
            </p>
          </div>
        ) : null}

        {!isProjectsLoading &&
        !isProjectsError &&
        defaultProject &&
        isPresenceError ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                Failed to load presence data.
              </p>
            </div>

            <Button variant="outline" onClick={onRetryPresence}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry presence
            </Button>
          </div>
        ) : null}

        {!isProjectsLoading &&
        !isProjectsError &&
        defaultProject &&
        !isPresenceLoading &&
        !isPresenceError ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Project</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {defaultProject.name}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Online users</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {onlineUsers.length}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Focused tasks</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {focusedUsersCount}
                </p>
              </div>
            </div>

            {onlineUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No users are currently online in this project.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {onlineUsers.slice(0, 3).map((member) => (
                  <div
                    key={member.userId}
                    className="rounded-2xl border border-border/60 bg-muted/25 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>

                      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                        Online
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      {member.focusedTaskTitle
                        ? `Focused on: ${member.focusedTaskTitle}`
                        : 'No focused task selected'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}