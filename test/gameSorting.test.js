import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareGamesByDateVenueTime } from '../src/utils/gameSorting.js'

const game = (id, date, venue) => ({ id, date, venue })

test('sorts cards by calendar date, then hall, then time', () => {
  const games = [
    game(1, '2026-09-12T16:00:00+02:00', 'Halle B'),
    game(2, '2026-09-12T09:00:00+02:00', 'Halle A'),
    game(3, '2026-09-12T08:00:00+02:00', 'Halle A'),
    game(4, '2026-09-13T09:00:00+02:00', 'Halle A')
  ]

  games.sort(compareGamesByDateVenueTime)

  assert.deepEqual(games.map(({ id }) => id), [3, 2, 1, 4])
})
