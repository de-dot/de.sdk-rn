export type AccessOptions = {
  env: 'dev' | 'prod'
  platform: 'web' | 'mobile' | 'server' | 'proxy'
  version?: number
  context: string
  accessToken: string
  remoteOrigin?: string
}