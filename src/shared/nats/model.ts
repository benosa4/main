import { makeAutoObservable } from "mobx"

export type NatsStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

export interface NatsLogItem {
  ts: number
  dir: 'in' | 'out'
  subject: string
  payload: string
}

class NatsStore {
  connected = false
  status: NatsStatus = 'disconnected'
  logs: NatsLogItem[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setConnected(state: boolean) {
    this.connected = state
  }

  setStatus(s: NatsStatus) {
    this.status = s
    this.connected = s === 'connected'
  }

  pushLog(item: NatsLogItem) {
    this.logs.push(item)
    if (this.logs.length > 200) this.logs.splice(0, this.logs.length - 200) // ring buffer
  }
}

export const natsStore = new NatsStore()
