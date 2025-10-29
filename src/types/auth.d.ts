export type AuthOptions = {
  env: 'dev' | 'prod'
  version?: number
  autorefresh?: boolean
  onNewToken?: (token: string) => void
}

export type AuthCredentials = {
  context: string
  remoteOrigin: string
  cid: string
  secret: string
}

export type SocketAuthCredentials = {
  utype: string
  id: string
  remoteOrigin: string
  accessToken: string
}

export type AuthRequestOptions = {
  url: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  headers?: { [index: string]: string }
  body?: any
}