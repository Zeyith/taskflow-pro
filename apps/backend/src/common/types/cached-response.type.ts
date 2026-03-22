export type CachedMeta = Readonly<{
  isCached: boolean;
}>;

export type CachedResponse<TData> = Readonly<{
  data: TData;
  meta: CachedMeta;
}>;
