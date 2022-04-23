export interface DiscordOauthResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: 'identify';
  token_type: 'Bearer';
}
