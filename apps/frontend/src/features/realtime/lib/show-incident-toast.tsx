'use client';

import { AlertTriangle, Info, ShieldAlert, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type IncidentToastPayload = {
  incidentId: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
};

type ShowIncidentToastParams = {
  incident: IncidentToastPayload;
  onClick: () => void;
};

export function showIncidentToast({
  incident,
  onClick,
}: ShowIncidentToastParams): void {
  const description =
    incident.description?.trim() || 'A new incident was created.';

  if (incident.severity === 'LOW') {
    toast(
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={onClick}
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 text-emerald-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{incident.title}</p>
          <p className="text-xs text-zinc-300">{description}</p>
        </div>
      </button>,
      {
        duration: 2000,
      },
    );

    return;
  }

  if (incident.severity === 'MEDIUM') {
    toast(
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={onClick}
      >
        <Info className="mt-0.5 h-4 w-4 text-sky-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{incident.title}</p>
          <p className="text-xs text-zinc-300">{description}</p>
        </div>
      </button>,
      {
        duration: 2500,
      },
    );

    return;
  }

  if (incident.severity === 'HIGH') {
    toast(
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={onClick}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{incident.title}</p>
          <p className="text-xs text-zinc-300">{description}</p>
        </div>
      </button>,
      {
        duration: 5000,
      },
    );

    return;
  }

  toast(
    <button
      type="button"
      className="flex w-full items-start gap-3 text-left"
      onClick={onClick}
    >
      <XCircle className="mt-0.5 h-4 w-4 text-red-400" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">{incident.title}</p>
        <p className="text-xs text-zinc-300">{description}</p>
      </div>
    </button>,
    {
      duration: Infinity,
      dismissible: true,
    },
  );
}