import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buildContactLinks, normalizeBallersGame, validateApplication } from '../src/modules/ballersclub/contact.js'

const game = { date: '2026-09-12T08:00:00Z', tournamentType: 'U12 Tour', timeLabel: '10:00–13:30', venue: 'Adalbertstraße', address: 'Straße 53, Berlin' }
const contact = { name: 'Julian Pokorny', phone: '4917622957481', email: 'schiedsrichter@albaberlin.de' }
test('generates matching WhatsApp/mail drafts with encoded names, licence and tournament details', () => {
  const result = buildContactLinks(game, contact, { name: 'Max & Mia', age: '18', license: 'LSE+' })
  const whatsapp = new URL(result.whatsapp)
  const mail = new URL(result.email)
  assert.equal(whatsapp.hostname, 'wa.me')
  assert.equal(whatsapp.searchParams.get('text'), result.body)
  assert.equal(mail.searchParams.get('body'), result.body)
  assert.match(result.body, /Max & Mia, ich bin 18 Jahre alt/)
  assert.match(result.body, /LSE\+/)
  assert.match(result.body, /12\.09\.2026/)
  assert.ok(result.body.endsWith('Lg\nMax & Mia'))
})
test('requires name, age and licence and rejects header injection in contact data', () => {
  assert.equal(Object.keys(validateApplication({})).length, 3)
  assert.ok(validateApplication({ name: 'Name', age: '-1', license: 'LSE' }).age)
  assert.throws(() => buildContactLinks(game, { ...contact, email: 'x@y.de?bcc=other@example.org' }, { name: 'Name', age: 20, license: 'LSE' }))
})
test('normalizes tournament entries without dummy teams, licences or TeamSL links', () => {
  const normalized = normalizeBallersGame({ tournamentId: 'abc', freeSpots: 1, totalSpots: 3, tournamentType: 'U12 Tour', spielfeldName: 'Halle' }, { homeTeam: 'Heimteam', license: 'LSE' })
  assert.equal(normalized.id, 'ballers-club:abc')
  assert.equal(normalized.sourceId, null)
  assert.equal(normalized.homeTeam, '')
  assert.equal(normalized.license, null)
})
test('both views open details with an icon-only action, with no Weekend League label', async () => {
  for (const file of ['BallersClubCard.vue', 'BallersClubRow.vue']) {
    const source = await readFile(new URL('../src/modules/ballersclub/' + file, import.meta.url), 'utf8')
    assert.match(source, /arrow-up-right-from-square/)
    assert.match(source, /Ballers <br>Club/)
    assert.doesNotMatch(source, /Anfrage per WhatsApp oder E-Mail/)
    assert.doesNotMatch(source, /Übernehmen/)
    assert.doesNotMatch(source, /Weekend League/i)
  }
  const css = await readFile(new URL('../src/modules/ballersclub/ballersclub.css', import.meta.url), 'utf8')
  assert.match(css, /\.bc-status\{[^}]*align-items:center;justify-content:center/)
  assert.doesNotMatch(css, /https?:\/\//)
  const card = await readFile(new URL('../src/modules/ballersclub/BallersClubCard.vue', import.meta.url), 'utf8')
  const row = await readFile(new URL('../src/modules/ballersclub/BallersClubRow.vue', import.meta.url), 'utf8')
  assert.match(card, /grid-template-areas:/)
  assert.match(card, /align-self:stretch/)
  assert.match(card, /bc-card-accent\{[^}]*top:0/)
  assert.match(card, /role="button"/)
  assert.match(card, /emit\('open'/)
  assert.match(row, /role="row"[\s\S]*tabindex="0"/)
  assert.match(row, /\.ballers-row::before/)
})
test('uses the shared desktop card height and opens a detail modal before requesting', async () => {
  const detail = await readFile(new URL('../src/modules/ballersclub/BallersClubDetailModal.vue', import.meta.url), 'utf8')
  const row = await readFile(new URL('../src/modules/ballersclub/BallersClubRow.vue', import.meta.url), 'utf8')
  const view = await readFile(new URL('../src/views/DesignMvpView.vue', import.meta.url), 'utf8')
  assert.match(detail, /40–50 €/)
  assert.match(detail, /je nach Länge des Turniers/)
  assert.match(detail, /weitere organisatorische Details bitte erfragen/)
  assert.match(detail, /Anfrage per WhatsApp oder E-Mail/)
  assert.match(detail, /emit\('request', game\)/)
  assert.match(detail, /replace\(\/\^Treffpunkt/)
  assert.match(view, /BallersClubDetailModal/)
  assert.match(view, /@request="openBallersApplication"/)
  assert.match(view, /@open="openBallersGame"/)
  assert.match(view, /selectedBallersApplicationGame/)
  assert.match(view, /showBallersClubFilter/)
  assert.match(view, /toggleBallersClubFilter/)
  assert.match(view, /labels\.push\(\{ key: 'source'/)
  assert.match(view, /quick-filter--ballers/)
  assert.match(row, /emit\('open'/)
})
