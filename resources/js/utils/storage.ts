class Storage {
  static key = 'shipperKeyStorage'
  get<T = any>(key: string) {
    const storage = JSON.parse(window.localStorage.getItem(Storage.key) || '{}')
    return (storage[key] as T) || null
  }
  set(key: string, value: any) {
    const storage = JSON.parse(window.localStorage.getItem(Storage.key) || '{}')
    storage[key] = value
    window.localStorage.setItem(Storage.key, JSON.stringify(storage))
  }
  remove(key: string) {
    const storage = JSON.parse(window.localStorage.getItem(Storage.key) || '{}')
    delete storage[key]
    window.localStorage.setItem(Storage.key, JSON.stringify(storage))
  }
}

export default new Storage()
