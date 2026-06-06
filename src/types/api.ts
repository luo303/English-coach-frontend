export type ApiTimestamp = {
  nanos: number;
  seconds: number;
};

export type ApiResponse<T> = {
  code: number;
  data: T;
  info: string;
  requestId: string;
};

export type ApiUser = {
  createdAt: ApiTimestamp;
  level: string;
  loginType: 'anonymous';
  nickname: string;
  updatedAt: ApiTimestamp;
  userId: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: ApiTimestamp;
  tokenType: 'Bearer';
  user: ApiUser;
};
