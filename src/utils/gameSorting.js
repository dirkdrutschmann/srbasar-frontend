function getTimestamp(game) {
  const timestamp = new Date(game?.date).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

export function getGameCalendarDateKey(game) {
  const timestamp = getTimestamp(game)
  if (timestamp === null) return ''

  const parts = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Berlin'
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return values.year + '-' + values.month + '-' + values.day
}

export function compareGamesByDateVenueTime(firstGame, secondGame, sortDirection = 'ASC') {
  const direction = sortDirection === 'DESC' ? -1 : 1
  const dateDifference = getGameCalendarDateKey(firstGame).localeCompare(
    getGameCalendarDateKey(secondGame),
    'en'
  )
  if (dateDifference !== 0) return dateDifference * direction

  const venueDifference = String(firstGame?.venue || '').localeCompare(
    String(secondGame?.venue || ''),
    'de-DE',
    { numeric: true, sensitivity: 'base' }
  )
  if (venueDifference !== 0) return venueDifference

  const firstTimestamp = getTimestamp(firstGame)
  const secondTimestamp = getTimestamp(secondGame)
  if (firstTimestamp !== null && secondTimestamp !== null) {
    return (firstTimestamp - secondTimestamp) * direction
  }
  if (firstTimestamp !== null) return -1
  if (secondTimestamp !== null) return 1

  return String(firstGame?.id || '').localeCompare(String(secondGame?.id || ''), 'de-DE', {
    numeric: true,
    sensitivity: 'base'
  })
}
