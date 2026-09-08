import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getRefereeAssignments, isGameAtRisk } from '../src/utils/refereeAssignments.js'

test('both SR positions must be openly offered to mark the game at risk', () => {
  assert.equal(isGameAtRisk({ sr1OffenAngeboten: true, sr2OffenAngeboten: true }), true)
  assert.equal(isGameAtRisk({ sr1OffenAngeboten: true, sr2OffenAngeboten: false }), false)
  assert.equal(isGameAtRisk({ sr1OffenAngeboten: false, sr2OffenAngeboten: true }), false)
  assert.equal(isGameAtRisk({ sr1OffenAngeboten: true, sr3OffenAngeboten: true }), false)
  assert.equal(isGameAtRisk({}), false)
  assert.equal(isGameAtRisk({ sr1OffenAngeboten: 'false', sr2OffenAngeboten: 'true' }), false)
})

test('keeps both full club names and gives the open offer precedence over assignment', () => {
  const assignments = getRefereeAssignments({
    sr1VereinName: 'DBV Charlottenburg', sr2VereinName: 'TuS Lichterfelde',
    sr1OffenAngeboten: true, sr1: true, sr2: true
  })
  assert.deepEqual(assignments.map(({ role, club, status }) => ({ role, club, status })), [
    { role: '1. SR', club: 'DBV Charlottenburg', status: 'open' },
    { role: '2. SR', club: 'TuS Lichterfelde', status: 'filled' }
  ])
  assert.equal(assignments[0].statusLabel, 'sucht')
  assert.equal(assignments[1].statusLabel, 'belegt')
})

test('does not hide the second club or invent an assignment when status is missing', () => {
  const assignments = getRefereeAssignments({
    sr1VereinName: 'Verein A', sr2VereinName: 'Verein B', sr1OffenAngeboten: true
  })
  assert.equal(assignments.length, 2)
  assert.equal(assignments[1].club, 'Verein B')
  assert.equal(assignments[1].statusLabel, 'keine Angabe')
  assert.equal(getRefereeAssignments({ sr2: false })[1].statusLabel, 'nicht besetzt')
})

test('falls back to related clubs and labels unknown clubs without using the playing teams', () => {
  const assignments = getRefereeAssignments({
    sr1Verein: { vereinsname: 'SR-Verein' }, heimMannschaftName: 'Heimteam', gastMannschaftName: 'Gastteam'
  })
  assert.equal(assignments[0].club, 'SR-Verein')
  assert.equal(assignments[1].club, 'Verein nicht angegeben')
})

test('includes a third SR position only when it is present', () => {
  assert.equal(getRefereeAssignments({ sr3: false }).length, 2)
  assert.equal(getRefereeAssignments({ sr3OffenAngeboten: true }).length, 3)
  assert.equal(getRefereeAssignments({ sr3VereinName: 'Dritter Verein' })[2].club, 'Dritter Verein')
})
