export type AccessOptions = {
  env: 'dev' | 'prod'
  version?: number
  context: string
  accessToken: string
  remoteOrigin?: string
}