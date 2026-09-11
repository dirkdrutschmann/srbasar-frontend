export function validateApplication({ name, age, license }) {
  const errors = {}
  if (!String(name || '').trim() || String(name).length > 100 || /[\r\n\0]/.test(name)) errors.name = 'Bitte gib deinen Namen an (maximal 100 Zeichen).'
  if (!/^\d{1,3}$/.test(String(age)) || Number(age) < 1 || Number(age) > 120) errors.age = 'Bitte gib ein gültiges Alter an.'
  if (!String(license || '').trim() || String(license).length > 40 || /[\r\n\0]/.test(license)) errors.license = 'Bitte gib deine Lizenzstufe an.'
  return errors
}

function toTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const timestamp = Date.parse(String(value || ''))
  return Number.isFinite(timestamp) ? timestamp : NaN
}

function durationFromTimeLabel(timeLabel) {
  const match = String(timeLabel || '').match(/(\d{1,2})[:.](\d{2})\s*[–-]\s*(\d{1,2})[:.](\d{2})/)
  if (!match) return null
  const startMinutes = Number(match[1]) * 60 + Number(match[2])
  const endMinutes = Number(match[3]) * 60 + Number(match[4])
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) return null
  return (endMinutes - startMinutes) / 60
}

export function getBallersDurationHours(game) {
  const start = toTimestamp(game?.date ?? game?.startsAt ?? game?.spieldatum)
  const end = toTimestamp(game?.endTimestamp ?? game?.endsAt)
  if (Number.isFinite(start) && Number.isFinite(end) && end > start) return Number(((end - start) / 3600000).toFixed(2))
  return durationFromTimeLabel(game?.timeLabel)
}

export function calculateBallersPayment(game) {
  const hours = getBallersDurationHours(game)
  return Number.isFinite(hours) ? Number((hours * 10 + 10).toFixed(2)) : null
}

export function formatBallersPayment(amount) {
  if (!Number.isFinite(amount)) return 'Auf Anfrage'
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(amount)} €`
}

export function formatBallersDuration(hours) {
  if (!Number.isFinite(hours)) return null
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(hours)
}

export function buildContactLinks(game, contact, application) {
  if (Object.keys(validateApplication(application)).length) throw new Error('Bitte vervollständige deine Angaben.')
  if (!/^[1-9]\d{6,14}$/.test(contact?.phone || '') || !/^[^\s@?&#\r\n]+@[^\s@?&#\r\n]+\.[^\s@?&#\r\n]+$/.test(contact?.email || '') || !contact?.name || /[\r\n]/.test(contact.name)) throw new Error('Die Kontaktdaten sind derzeit nicht verfügbar.')
  const date = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(game.date))
  const name = application.name.trim()
  const type = game.tournamentType
  const body = `Hallo ${contact.name},\n\nich würde gerne beim Ballers Club pfeifen.\nFür folgendes Turnier habe ich Verfügbarkeit:\n\n${type} am ${date}\n${game.timeLabel}\nHalle: ${game.venue}${game.address ? ', ' + game.address : ''}\n\nMein Name ist ${name}, ich bin ${Number(application.age)} Jahre alt und habe folgende Lizenz: ${application.license.trim()}.\n\nLg\n${name}`
  const subject = `Ballers Club – Verfügbarkeit für ${type} am ${date}`
  return { body, subject, whatsapp: `https://wa.me/${contact.phone}?text=${encodeURIComponent(body)}`, email: `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` }
}

export function normalizeBallersGame(game, base) {
  return { ...base, id: game.id || `ballers-club:${game.tournamentId}`, source: 'ballers-club', sourceId: null,
    tournamentType: game.tournamentType, timeLabel: game.timeLabel || 'Uhrzeit folgt', meetingTime: game.meetingTime, endTimestamp: Number(game.endTimestamp),
    freeSpots: Number(game.freeSpots), totalSpots: Number(game.totalSpots), sourceHallName: game.sourceHallName,
    hallId: game.hallId, license: null, homeTeam: '', awayTeam: '', isAtRisk: false,
    venue: game.spielfeldName || game.sourceHallName || 'Halle folgt', city: game.spielOrt || '',
    time: game.timeLabel || 'Uhrzeit folgt', refereeAssignments: [] }
}
