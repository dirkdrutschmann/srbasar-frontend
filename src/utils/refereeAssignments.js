function isTrue(value) {
  return value === true || value === 1 || value === 'true' || value === '1'
}

export function isGameAtRisk(game) {
  return isTrue(game.sr1OffenAngeboten) && isTrue(game.sr2OffenAngeboten)
}

export function getRefereeAssignments(game) {
  return [1, 2, 3].flatMap((number) => {
    const key = 'sr' + number
    const club = String(game[key + 'VereinName'] || game[key + 'Verein']?.vereinsname || '').trim()
    const open = isTrue(game[key + 'OffenAngeboten'])
    const assigned = isTrue(game[key])
    if (number === 3 && !club && !open && !assigned) return []

    let status = 'unknown'
    let statusLabel = 'keine Angabe'
    let statusIcon = ['fas', 'minus']
    if (open) {
      status = 'open'
      statusLabel = 'sucht'
      statusIcon = ['fas', 'magnifying-glass']
    } else if (assigned) {
      status = 'filled'
      statusLabel = 'belegt'
      statusIcon = ['fas', 'check']
    } else if (game[key] === false) {
      statusLabel = 'nicht besetzt'
    }

    return [{ role: number + '. SR', club: club || 'Verein nicht angegeben', status, statusLabel, statusIcon }]
  })
}
