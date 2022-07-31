export function formatMoney(value: any) {
  value = value + ''
  value = value.replace(/.,/g, '')
  let result = ''
  const length = value.length
  for (let i = length - 1; i >= 0; i--) {
    result = value[i] + result
    if ((length - i) % 3 === 0 && i !== 0) {
      result = '.' + result
    }
  }
  return result + ' vnđ'
}

export function getRelativeTime(value: string) {
  const date = new Date(value).getTime()
  const now = Date.now()
  return difference(now, date)
}

export function difference(current: number, previous: number) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365
  const elapsed = current - previous
  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago'
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago'
  } else if (elapsed < msPerMonth) {
    return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago'
  } else if (elapsed < msPerYear) {
    return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago'
  } else {
    return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago'
  }
}
export function formatDate(value: string | null, seperator = '/') {
  if (!value) return '-'
  const date = new Date(value)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const month =
    date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minute =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  return `${day}${seperator}${month}${seperator}${year} ${hour}:${minute}`
}
export function formatDateOnly(value: string | null, seperator = '/') {
  if (!value) return '-'
  const date = new Date(value)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const month =
    date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}${seperator}${month}${seperator}${year}`
}

export function formatDateOnlyHour(value: string, seperator = ':') {
  if (!value) return '-'
  const date = new Date(value)
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minute =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  return `${hour}${seperator}${minute}`
}

export function formatDateToDate(value: string) {
  if (!value) return '-'
  const date = value.split('-')
  return `${date[2]}/${date[1]}/${date[0]}`
}

export function formatDateForInput(value: string) {
  if (!value) return ''
  const date = new Date(value)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const month =
    date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}
export function formatDateToDateDB(value: Date | null | string) {
  if (!value) return null
  const date = new Date(value)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const month =
    date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}
