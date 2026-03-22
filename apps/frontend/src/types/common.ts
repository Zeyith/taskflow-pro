export type UserRole = 'TEAM_LEAD' | 'EMPLOYEE';

export type ApiMeta = {
  isCached: boolean;
};

export type ApiSuccessResponse<TData> = {
  data: TData;
  meta: ApiMeta;
};

export type ApiErrorResponse = {
  type: string;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  statusCode: number;
};