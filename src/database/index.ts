import Dexie, { Table } from 'dexie'

export interface Website {
  id?: number
  url: string
  content: string
}

export class MySubClassedDexie extends Dexie {
  websites!: Table<Website>

  constructor () {
    super('myDatabase')
    this.version(1).stores({
      websites: '++id, url, content'
    })
  }
}

export const db = new MySubClassedDexie()
