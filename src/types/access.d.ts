export type AccessOptions = {
  env?: 'dev' | 'prod'
  version?: number
  workspace: string
  accessToken: string
  remoteOrigin?: string
}