"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

function getServerSnapshot(): boolean {
  return false;
}

function getClientSnapshot(): boolean {
  return true;
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
