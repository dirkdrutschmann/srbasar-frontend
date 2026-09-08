<template>
  <section
    class="design-mvp"
    :data-theme="theme"
    tabindex="-1"
    @keydown.esc="closeOverlays"
  >
    <a class="skip-link" href="#mvp-main">Zum Inhalt springen</a>

    <div class="mvp-shell">
      <main id="mvp-main" class="mvp-main">
        <section class="basar-page" aria-labelledby="basar-title">
          <div class="page-heading">
            <div>
              <p class="eyebrow">Spielbörse für Schiedsrichter</p>
              <h1 id="basar-title">Finde dein nächstes Spiel.</h1>
              <p class="page-intro">Vereine stellen offene Spiele ein – übernehmen sie direkt.</p>
            </div>
            <div class="refresh-controls">
              <label class="auto-update-toggle">
                <input v-model="autoUpdateEnabled" type="checkbox" @change="toggleAutoUpdate" />
                <span class="auto-update-check" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'check']" />
                </span>
                <span class="auto-update-copy">
                  <strong>Auto-Update</strong>
                  <small>{{ autoUpdateEnabled ? 'aktiv' : 'pausiert' }}</small>
                </span>
              </label>
              <div
                class="refresh-button-frame"
                :class="{ 'is-active': autoUpdateEnabled, 'is-refreshing': isRefreshing }"
                :style="{ '--countdown-progress': autoUpdateEnabled ? countdownProgress : 0 }"
              >
                <button
                  class="secondary-action refresh-action"
                  :class="{ 'is-loading': isRefreshing }"
                  type="button"
                  :disabled="isRefreshing"
                  :aria-label="autoUpdateEnabled ? 'Spiele aktualisieren, nächste automatische Aktualisierung in ' + countdown + ' Sekunden' : 'Spiele aktualisieren'"
                  @click="refreshGames"
                >
                  <font-awesome-icon :icon="['fas', 'rotate']" aria-hidden="true" />
                  <span>{{ isRefreshing ? 'Aktualisiere …' : 'Aktualisieren' }}</span>
                </button>
              </div>
              <button
                class="secondary-action theme-toggle"
                type="button"
                :aria-pressed="theme === 'dark'"
                :aria-label="theme === 'light' ? 'Dunkles Theme aktivieren' : 'Helles Theme aktivieren'"
                @click="toggleTheme"
              >
                <font-awesome-icon :icon="theme === 'light' ? ['fas', 'moon'] : ['fas', 'sun']" aria-hidden="true" />
              </button>
            </div>
          </div>

          <section class="search-panel" aria-label="Spiele durchsuchen">
            <div class="search-row">
              <label class="search-input">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" aria-hidden="true" />
                <span class="sr-only">Spiele suchen</span>
                <input
                  v-model="search"
                  type="search"
                  placeholder="Verein, Halle oder Liga suchen …"
                />
                <button v-if="search" class="clear-search" type="button" aria-label="Suche leeren" @click="search = ''">
                  <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
                </button>
              </label>
              <button class="filter-button" type="button" @click="isFilterSheetOpen = true">
                <font-awesome-icon :icon="['fas', 'sliders']" aria-hidden="true" />
                <span>Filter</span>
                <span v-if="filterCount" class="filter-count">{{ filterCount }}</span>
              </button>
            </div>

            <div class="quick-filter-row" aria-label="Schnellfilter">
              <button
                v-for="quickFilter in visibleQuickFilters"
                :key="quickFilter.id"
                class="quick-filter"
                :class="{ 'is-active': isQuickFilterActive(quickFilter.id), 'quick-filter--risk': quickFilter.id === 'atRisk' }"
                :aria-pressed="isQuickFilterActive(quickFilter.id)"
                type="button"
                @click="toggleQuickFilter(quickFilter.id)"
              >
                <font-awesome-icon :icon="quickFilter.icon" aria-hidden="true" />
                {{ getQuickFilterLabel(quickFilter) }}
                <span v-if="quickFilter.id === 'atRisk'" class="quick-filter-total">{{ atRiskCount }}</span>
              </button>
            </div>

            <div v-if="activeFilterLabels.length" class="active-filters" aria-label="Aktive Filter">
              <span class="active-filter-label">Aktiv:</span>
              <button
                v-for="activeFilter in activeFilterLabels"
                :key="activeFilter.key"
                class="active-filter"
                type="button"
                @click="removeFilter(activeFilter.key)"
              >
                {{ activeFilter.label }}
                <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
              </button>
              <button class="clear-filters" type="button" @click="clearFilters">Alle zurücksetzen</button>
            </div>

          </section>

          <div class="results-heading">
            <div>
              <p class="eyebrow">Für dich ausgewählt</p>
              <h2>Offene Spiele <span class="result-count">{{ resultCount }}</span></h2>
              <p class="results-meta">Zuletzt aktualisiert {{ lastUpdated }}</p>
            </div>
            <div class="results-tools">
              <div class="view-switcher" role="group" aria-label="Darstellung auswählen">
                <button
                  class="view-switcher-button"
                  :class="{ 'is-active': effectiveViewMode === 'cards' }"
                  type="button"
                  :aria-pressed="effectiveViewMode === 'cards'"
                  title="Kartenansicht"
                  @click="viewMode = 'cards'"
                >
                  <font-awesome-icon :icon="['fas', 'table-cells-large']" aria-hidden="true" />
                  <span class="sr-only">Kartenansicht</span>
                </button>
                <button
                  v-if="isTableViewAvailable"
                  class="view-switcher-button"
                  :class="{ 'is-active': effectiveViewMode === 'list' }"
                  type="button"
                  :aria-pressed="effectiveViewMode === 'list'"
                  title="Listenansicht"
                  @click="viewMode = 'list'"
                >
                  <font-awesome-icon :icon="['fas', 'list']" aria-hidden="true" />
                  <span class="sr-only">Listenansicht</span>
                </button>
              </div>
              <div v-if="effectiveViewMode === 'cards'" class="sort-control">
                <span>Sortieren</span>
                <select v-model="sortBy" aria-label="Spiele sortieren">
                  <option value="date">Bald verfügbar</option>
                  <option v-if="userLocation" value="distance">Kürzeste Entfernung</option>
                  <option value="league">Liga A–Z</option>
                  <option value="venue">Halle A–Z</option>
                  <option value="homeTeam">Heimteam A–Z</option>
                  <option value="awayTeam">Gastteam A–Z</option>
                  <option value="license">Lizenz A–Z</option>
                </select>
                <font-awesome-icon :icon="['fas', 'chevron-down']" aria-hidden="true" />
                <button
                  class="sort-direction-button"
                  type="button"
                  :aria-label="sortDirection === 'ASC' ? 'Absteigend sortieren' : 'Aufsteigend sortieren'"
                  :title="sortDirection === 'ASC' ? 'Absteigend sortieren' : 'Aufsteigend sortieren'"
                  @click="toggleSortDirection"
                >
                  <font-awesome-icon :icon="sortDirection === 'ASC' ? ['fas', 'sort-up'] : ['fas', 'sort-down']" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="previewMode === 'loading'" class="skeleton-list" aria-live="polite" aria-label="Spiele werden geladen">
            <article v-for="skeleton in 3" :key="skeleton" class="game-card skeleton-card">
              <div class="skeleton-line skeleton-line--short"></div>
              <div class="skeleton-card-body">
                <div class="skeleton-date"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-line--small"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line skeleton-line--medium"></div>
                </div>
              </div>
              <div class="skeleton-line skeleton-line--button"></div>
            </article>
          </div>

          <div v-else-if="previewMode === 'error'" class="state-card state-card--error" role="alert">
            <span class="state-icon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
            </span>
            <div class="state-content">
              <p class="eyebrow">Verbindung prüfen</p>
              <h3>Spiele konnten nicht geladen werden.</h3>
              <p>{{ liveApiError || 'Bitte versuche es erneut. Deine Filter bleiben dabei erhalten.' }}</p>
            </div>
            <button class="primary-action" type="button" @click="retryPreview">
              Erneut versuchen
              <font-awesome-icon :icon="['fas', 'arrow-right']" aria-hidden="true" />
            </button>
          </div>

          <div v-else-if="previewMode === 'empty' || !visibleGames.length" class="state-card state-card--empty">
            <span class="state-icon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </span>
            <div class="state-content">
              <p class="eyebrow">Keine Treffer</p>
              <h3>Heute ist noch Platz auf deiner Pfeife.</h3>
              <p>Ändere deine Suche oder setze die Filter zurück, um weitere Spiele zu sehen.</p>
            </div>
            <button class="secondary-action" type="button" @click="clearFilters">Filter zurücksetzen</button>
          </div>

          <div
            v-else-if="effectiveViewMode === 'list'"
            class="game-table"
            :class="{ 'game-table--with-distance': userLocation }"
            role="table"
            aria-label="Spiele als Liste"
            aria-live="polite"
          >
            <div class="game-table-header" role="row">
              <div
                v-for="column in visibleTableColumns"
                :key="column.id"
                class="table-header-cell"
                :class="'table-header-cell--' + column.id"
                role="columnheader"
                :aria-sort="getTableAriaSort(column.id)"
              >
                <button
                  v-if="column.sortable"
                  class="table-sort-button"
                  :class="{ 'is-active': sortBy === column.sortKey }"
                  type="button"
                  :aria-label="getTableSortLabel(column)"
                  @click="setTableSort(column.sortKey)"
                >
                  <font-awesome-icon :icon="column.icon" class="table-header-icon" aria-hidden="true" />
                  <span>{{ column.label }}</span>
                  <font-awesome-icon :icon="getTableSortIcon(column.id)" class="table-sort-icon" aria-hidden="true" />
                </button>
                <span v-else class="table-header-label">
                  <font-awesome-icon :icon="column.icon" class="table-header-icon" aria-hidden="true" />
                  {{ column.label }}
                </span>
              </div>
              <span role="columnheader"><span class="sr-only">Details</span></span>
            </div>
            <article
              v-for="game in visibleGames"
              :key="game.id"
              class="game-table-row"
              :class="{ 'game-table-row--at-risk': game.isAtRisk }"
              role="rowgroup"
              tabindex="0"
              :aria-label="'Details zu ' + game.homeTeam + ' gegen ' + game.awayTeam"
              @click="openGame(game)"
              @keydown.enter="openGame(game)"
              @keydown.space.prevent="openGame(game)"
            >
              <div class="game-table-main" role="row">
                <div class="table-cell table-cell--date" role="cell">
                  <strong>{{ game.weekday }}, {{ game.day }}. {{ game.month }}</strong>
                  <time :datetime="game.date">{{ game.time }} Uhr</time>
                </div>
                <div class="table-cell table-cell--venue" role="cell">
                  <span>{{ game.venue }}</span>
                  <small>{{ game.city }}</small>
                </div>
                <div class="table-cell table-cell--league" role="cell">
                  <strong>{{ game.league }}</strong>
                </div>
                <div class="table-cell table-cell--home" role="cell">
                  <strong>{{ game.homeTeam }}</strong>
                </div>
                <div class="table-cell table-cell--away" role="cell">
                  <strong>{{ game.awayTeam }}</strong>
                </div>
                <div class="table-cell table-cell--license" role="cell">
                  <span class="game-tag game-tag--license">{{ game.license }}</span>
                </div>
                <div v-if="userLocation" class="table-cell table-cell--distance" role="cell">
                  <small class="table-cell-label">Entfernung</small>
                  <span v-if="Number.isFinite(game.distanceKm)" class="table-distance">
                    <font-awesome-icon :icon="['fas', 'route']" aria-hidden="true" />
                    {{ game.distance }}
                  </span>
                  <span v-else class="table-distance table-distance--unknown">—</span>
                </div>
                <div class="table-cell table-cell--action" role="cell">
                  <span title="Spieldetails öffnen">
                    <span class="sr-only">Details</span>
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div class="game-table-secondary" role="row">
                <div
                  class="table-cell table-cell--assignment"
                  role="cell"
                  aria-colindex="1"
                  :aria-colspan="visibleTableColumns.length + 1"
                >
                  <RefereeAssignments :assignments="game.refereeAssignments" layout="table" />
                  <GameRiskBadge v-if="game.isAtRisk" variant="ribbon" />
                </div>
              </div>
            </article>
          </div>

          <div v-else class="game-list" aria-live="polite">
            <article
              v-for="game in visibleGames"
              :key="game.id"
              class="game-card"
              :class="{ 'game-card--at-risk': game.isAtRisk }"
              role="button"
              tabindex="0"
              :aria-label="'Details zu ' + game.homeTeam + ' gegen ' + game.awayTeam"
              @click="openGame(game)"
              @keydown.enter="openGame(game)"
              @keydown.space.prevent="openGame(game)"
            >
              <div class="game-card-header">
                <p class="match-label">{{ game.league }}</p>
                <span class="match-time">
                  <font-awesome-icon :icon="['fas', 'clock']" aria-hidden="true" />
                  {{ game.startsIn }}
                </span>
              </div>

              <div class="game-card-body">
                <div class="game-date" :class="'game-date--' + game.accent">
                  <span>{{ game.weekday }}</span>
                  <strong>{{ game.day }}</strong>
                  <span>{{ game.month }}</span>
                  <time class="game-date-time" :datetime="game.date">{{ game.time }} Uhr</time>
                </div>
                <div class="game-information">
                  <h3 class="match-teams">
                    <span class="match-team"><small>Heim</small><span>{{ game.homeTeam }}</span></span>
                    <span class="match-team"><small>Gast</small><span>{{ game.awayTeam }}</span></span>
                  </h3>
                  <p class="venue-line">
                    <font-awesome-icon :icon="['fas', 'location-dot']" aria-hidden="true" />
                    <span>{{ game.venue }} · {{ game.city }}</span>
                  </p>
                </div>

                <div class="card-referees">
                  <RefereeAssignments :assignments="game.refereeAssignments" />
                </div>
              </div>

              <div class="game-card-footer">
                <div class="game-tags">
                  <span v-if="userLocation && Number.isFinite(game.distanceKm)" class="game-tag">{{ game.distance }}</span>
                  <span class="game-tag game-tag--license">{{ game.license }}</span>
                  <GameRiskBadge v-if="game.isAtRisk" />
                </div>
                <span class="card-action" aria-hidden="true">
                  Details
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
                </span>
              </div>
            </article>
          </div>

          <nav
            v-if="previewMode === 'success' && visibleGames.length && totalPages > 1"
            class="pagination"
            aria-label="Seitennavigation"
          >
            <p class="pagination-summary">{{ paginationStart }}–{{ paginationEnd }} von {{ resultCount }} Spielen</p>
            <div class="pagination-actions">
              <button
                class="pagination-button pagination-button--arrow"
                type="button"
                :disabled="currentPage === 1"
                aria-label="Vorherige Seite"
                @click="goToPage(currentPage - 1)"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" aria-hidden="true" />
                <span class="pagination-button-label">Zurück</span>
              </button>
              <template v-for="pageItem in paginationItems" :key="pageItem.key">
                <span v-if="pageItem.type === 'ellipsis'" class="pagination-ellipsis" aria-hidden="true">…</span>
                <button
                  v-else
                  class="pagination-button pagination-button--page"
                  :class="{ 'is-active': pageItem.page === currentPage }"
                  type="button"
                  :aria-current="pageItem.page === currentPage ? 'page' : undefined"
                  :aria-label="'Seite ' + pageItem.page"
                  @click="goToPage(pageItem.page)"
                >
                  {{ pageItem.page }}
                </button>
              </template>
              <button
                class="pagination-button pagination-button--arrow"
                type="button"
                :disabled="currentPage === totalPages"
                aria-label="Nächste Seite"
                @click="goToPage(currentPage + 1)"
              >
                <span class="pagination-button-label">Weiter</span>
                <font-awesome-icon :icon="['fas', 'chevron-right']" aria-hidden="true" />
              </button>
            </div>
          </nav>

        </section>

      </main>

      <footer class="mvp-footer">
        <div class="mvp-footer-inner">
          <div class="mvp-footer-brand">
            <strong>SR Basar</strong>
            <span>Spielbörse für Schiedsrichter</span>
          </div>
          <nav class="mvp-footer-links" aria-label="Service und Rechtliches">
            <a class="mvp-footer-link" href="mailto:problems@srbasar.de">
              <font-awesome-icon :icon="['fas', 'envelope']" aria-hidden="true" />
              Problem melden
            </a>
            <button class="mvp-footer-link" type="button" @click="isImprintOpen = true">Impressum</button>
            <button class="mvp-footer-link" type="button" @click="isSupportOpen = true">
              <font-awesome-icon :icon="['fas', 'heart']" aria-hidden="true" />
              Unterstützen
            </button>
            <div class="mvp-footer-github" :class="{ 'is-open': isGithubTooltipOpen }">
              <button
                class="mvp-footer-link mvp-footer-github-trigger"
                type="button"
                aria-haspopup="true"
                :aria-expanded="isGithubTooltipOpen"
                aria-controls="mvp-github-links"
                @click="isGithubTooltipOpen = !isGithubTooltipOpen"
              >
                <font-awesome-icon :icon="['fab', 'github']" aria-hidden="true" />
                <span>GitHub</span>
                <font-awesome-icon
                  class="mvp-footer-github-chevron"
                  :icon="['fas', 'chevron-down']"
                  aria-hidden="true"
                />
              </button>
              <div
                id="mvp-github-links"
                class="mvp-footer-github-tooltip"
                :class="{ 'is-open': isGithubTooltipOpen }"
                aria-label="GitHub-Repositories"
              >
                <span class="mvp-footer-github-title">Quellcode ansehen</span>
                <a
                  :href="githubFrontendUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Frontend</span>
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
                </a>
                <a
                  :href="githubBackendUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Backend</span>
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
                </a>
              </div>
            </div>
          </nav>
          <span class="mvp-footer-copyright">© 2026 Dirk Drutschmann</span>
        </div>
      </footer>
    </div>

    <button
      v-if="!isFilterSheetOpen && !isRadiusPickerOpen && !selectedGame && !isImprintOpen && !isSupportOpen"
      class="mobile-filter-fab"
      type="button"
      @click="isFilterSheetOpen = true"
    >
      <font-awesome-icon :icon="['fas', 'sliders']" aria-hidden="true" />
      <span>Filter</span>
      <span v-if="filterCount" class="mobile-filter-fab-count">{{ filterCount }}</span>
    </button>

    <Teleport to="body">
      <div class="design-mvp mvp-teleport-root" :data-theme="theme">
        <div v-if="isImprintOpen" class="modal-backdrop" @click.self="isImprintOpen = false">
      <section class="legal-sheet" role="dialog" aria-modal="true" aria-labelledby="imprint-title">
        <div class="sheet-header">
          <div>
            <p class="eyebrow">Rechtliche Hinweise</p>
            <h2 id="imprint-title">Impressum</h2>
          </div>
          <button class="icon-button icon-button--subtle" type="button" aria-label="Impressum schließen" @click="isImprintOpen = false">
            <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
          </button>
        </div>
        <div class="legal-content">
          <p><strong>Angaben gemäß § 5 DDG</strong><br />Dirk Drutschmann<br />Freiberuflicher Web-Entwickler (B.A. Medieninformatik)<br />Gabainstraße 11<br />12247 Berlin<br />Deutschland</p>
          <p><strong>Kontakt</strong><br />E-Mail: <a href="mailto:mail@drutschmann.dev">mail@drutschmann.dev</a></p>
          <p><strong>Steuerliche Angaben</strong><br />St.-Nr.: 17/046/09416</p>
          <p><strong>Haftungsausschluss</strong><br />Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr übernommen. Für externe Links ist ausschließlich deren jeweiliger Betreiber verantwortlich.</p>
          <p class="legal-note"><strong>Cookies &amp; lokaler Speicher</strong><br />Keine zustimmungspflichtigen Tracking- oder Marketing-Cookies. Die Theme-Präferenz wird ausschließlich lokal im Browser gespeichert.</p>
        </div>
      </section>
        </div>

        <div v-if="isSupportOpen" class="modal-backdrop" @click.self="isSupportOpen = false">
      <section class="support-sheet" role="dialog" aria-modal="true" aria-labelledby="support-title">
        <div class="support-accent" aria-hidden="true"></div>
        <div class="support-sheet-content">
          <div class="sheet-header">
            <div>
              <p class="eyebrow">Projekt unterstützen</p>
              <h2 id="support-title">Unterstützen</h2>
            </div>
            <button class="icon-button icon-button--subtle" type="button" aria-label="Unterstützen schließen" @click="isSupportOpen = false">
              <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
            </button>
          </div>

          <div class="support-intro">
            <span class="support-intro-icon" aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'heart']" />
            </span>
            <div>
              <h3>Hilf, den SR-Basar weiterzuentwickeln.</h3>
              <p>Der SR-Basar soll offen und unkompliziert bleiben. Deine Unterstützung hilft bei Betrieb, Datenabrufen und der Weiterentwicklung.</p>
            </div>
          </div>

          <div class="support-points" aria-label="Wofür deine Unterstützung hilft">
            <div class="support-point">
              <span class="support-point-icon" aria-hidden="true"><font-awesome-icon :icon="['fas', 'server']" /></span>
              <span><strong>Betrieb sichern</strong><small>Server und laufende Kosten abdecken.</small></span>
            </div>
            <div class="support-point">
              <span class="support-point-icon" aria-hidden="true"><font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" /></span>
              <span><strong>Weiterentwicklung ermöglichen</strong><small>Suche, Filter und Darstellung weiter verbessern.</small></span>
            </div>
          </div>

          <p class="support-paypal-note">
            <font-awesome-icon :icon="['fab', 'paypal']" aria-hidden="true" />
            Die Unterstützung wird sicher über PayPal abgewickelt.
          </p>
        </div>

        <div class="sheet-actions support-actions">
          <button class="secondary-action" type="button" @click="isSupportOpen = false">Später</button>
          <a class="primary-action" :href="paypalSupportUrl" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon :icon="['fab', 'paypal']" aria-hidden="true" />
            Unterstützen
            <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
          </a>
        </div>
      </section>
        </div>

        <div v-if="isFilterSheetOpen" class="modal-backdrop" @click.self="closeFilterSheet">
      <section class="filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-title">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-header">
          <div>
            <p class="eyebrow">Suche verfeinern</p>
            <h2 id="filter-title">Filter</h2>
          </div>
          <button class="icon-button icon-button--subtle" type="button" aria-label="Filter schließen" @click="closeFilterSheet">
            <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
          </button>
        </div>

        <div class="filter-fields">
          <div v-for="filter in filterDefinitions" :key="filter.id" class="filter-field filter-dropdown-field">
              <span>{{ filter.label }}</span>
            <button
              class="filter-dropdown-trigger"
              :ref="(element) => setFilterTriggerRef(filter.id, element)"
              type="button"
              :aria-expanded="openFilterDropdown === filter.id"
              :aria-controls="'filter-dropdown-' + filter.id"
              @click="toggleFilterDropdown(filter.id)"
            >
              <span class="filter-dropdown-value" :class="{ 'is-placeholder': isFilterDefault(filter.id) }">
                {{ getFilterDisplayLabel(filter.id) }}
              </span>
              <font-awesome-icon :icon="['fas', 'chevron-down']" aria-hidden="true" />
            </button>

            <Teleport to="body">
              <div
                v-if="openFilterDropdown === filter.id"
                class="design-mvp mvp-teleport-root mvp-dropdown-teleport-root"
                :data-theme="theme"
              >
                <div
                  :id="'filter-dropdown-' + filter.id"
                  class="filter-dropdown-menu"
                  :style="filterDropdownMenuStyle"
                  @click.stop
                >
                  <div class="filter-dropdown-search">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" aria-hidden="true" />
                    <input
                      ref="filterDropdownSearchInput"
                      v-model="filterDropdownSearch"
                      type="search"
                      :aria-label="filter.searchLabel"
                      :placeholder="filter.searchPlaceholder"
                      @keydown.esc="closeFilterDropdown"
                    />
                    <button
                      v-if="filterDropdownSearch"
                      type="button"
                      aria-label="Auswahlsuche leeren"
                      @click="filterDropdownSearch = ''"
                    >
                      <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
                    </button>
                  </div>

                  <div
                    class="filter-dropdown-options"
                    role="listbox"
                    :aria-label="filter.label"
                    :aria-multiselectable="filter.multiple ? 'true' : undefined"
                  >
                    <button
                      v-if="filter.id === 'venue'"
                      class="filter-dropdown-option"
                      :class="{ 'is-selected': !filters.venue.length }"
                      type="button"
                      role="option"
                      :aria-selected="!filters.venue.length"
                      @click="clearVenueFilter"
                    >
                      <span>Alle Hallen</span>
                      <font-awesome-icon v-if="!filters.venue.length" :icon="['fas', 'check']" aria-hidden="true" />
                    </button>
                    <button
                      v-for="option in getFilterOptions(filter)"
                      :key="option"
                      class="filter-dropdown-option"
                      :class="{ 'is-selected': isFilterOptionSelected(filter.id, option) }"
                      type="button"
                      role="option"
                      :aria-selected="isFilterOptionSelected(filter.id, option)"
                      @click="selectFilterOption(filter.id, option)"
                    >
                      <span>{{ option }}</span>
                      <font-awesome-icon v-if="isFilterOptionSelected(filter.id, option)" :icon="['fas', 'check']" aria-hidden="true" />
                    </button>
                    <p v-if="!getFilterOptions(filter).length" class="filter-dropdown-empty">Keine verfügbaren Optionen</p>
                  </div>
                  <p v-if="filter.multiple && filters.venue.length" class="filter-dropdown-summary">
                    {{ filters.venue.length }} Hallen ausgewählt
                  </p>
                </div>
              </div>
            </Teleport>
            <div v-if="filter.id === 'date' && filters.date === 'Bestimmtes Datum'" class="filter-date-picker">
              <div class="date-picker-heading">
                <div>
                  <span>Datum auswählen</span>
                  <strong>{{ filters.dateValue ? formatCalendarDate(filters.dateValue) : 'Bitte Datum wählen' }}</strong>
                </div>
                <font-awesome-icon :icon="['fas', 'calendar-days']" aria-hidden="true" />
              </div>
              <div class="date-picker-calendar" aria-label="Kalender zur Datumsauswahl">
                <div class="date-picker-toolbar">
                  <button
                    class="date-picker-nav"
                    type="button"
                    aria-label="Vorheriger Monat"
                    :disabled="!canGoToPreviousCalendarMonth"
                    @click="changeCalendarMonth(-1)"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-left']" aria-hidden="true" />
                  </button>
                  <strong>{{ calendarMonthLabel }}</strong>
                  <button class="date-picker-nav" type="button" aria-label="Nächster Monat" @click="changeCalendarMonth(1)">
                    <font-awesome-icon :icon="['fas', 'chevron-right']" aria-hidden="true" />
                  </button>
                </div>
                <div class="date-picker-weekdays" aria-hidden="true">
                  <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
                </div>
                <div class="date-picker-grid">
                  <button
                    v-for="day in calendarDays"
                    :key="day.value"
                    class="date-picker-day"
                    :class="{
                      'is-outside': !day.isCurrentMonth,
                      'is-today': day.isToday,
                      'is-selected': day.isSelected
                    }"
                    type="button"
                    :disabled="day.isDisabled"
                    :aria-label="formatCalendarDate(day.value)"
                    :aria-pressed="day.isSelected"
                    @click="selectCalendarDate(day.value)"
                  >
                    {{ day.day }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            class="nearby-toggle"
            type="button"
            aria-haspopup="dialog"
            @click="openNearbyRadiusPicker"
          >
            <span class="nearby-toggle-copy">
              <strong>Nur in deiner Nähe</strong>
              <small>{{ filters.nearbyOnly ? selectedRadiusKm + ' km Umkreis aktiv · ändern' : 'Umkreis auswählen' }}</small>
            </span>
            <span class="toggle-track" :class="{ 'is-active': filters.nearbyOnly }" aria-hidden="true"><span></span></span>
          </button>
          <button
            v-if="hasAtRiskGames || filters.atRiskOnly"
            class="nearby-toggle risk-filter-toggle"
            type="button"
            :aria-pressed="filters.atRiskOnly"
            @click="toggleQuickFilter('atRisk')"
          >
            <span class="nearby-toggle-copy">
              <strong>Ausfall bedroht</strong>
              <small>Beide SR-Vereine suchen noch Schiedsrichter</small>
            </span>
            <span class="toggle-track" :class="{ 'is-active': filters.atRiskOnly }" aria-hidden="true"><span></span></span>
          </button>
        </div>

        <div class="sheet-actions">
          <button class="secondary-action" type="button" @click="clearFilters">Zurücksetzen</button>
          <button class="primary-action" type="button" @click="closeFilterSheet">
            {{ resultCount }} Spiele anzeigen
            <font-awesome-icon :icon="['fas', 'arrow-right']" aria-hidden="true" />
          </button>
        </div>
      </section>
        </div>

        <div v-if="isRadiusPickerOpen" class="modal-backdrop" @click.self="closeRadiusPicker">
      <section class="radius-sheet" role="dialog" aria-modal="true" aria-labelledby="radius-title">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-header">
          <div>
            <p class="eyebrow">Standortfilter</p>
            <h2 id="radius-title">Umkreis festlegen</h2>
          </div>
          <button class="icon-button icon-button--subtle" type="button" aria-label="Umkreisauswahl schließen" @click="closeRadiusPicker">
            <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
          </button>
        </div>

        <p class="radius-intro">Wähle, wie weit eine Halle von deinem aktuellen Standort entfernt sein darf.</p>

        <div class="radius-value" aria-live="polite">
          <strong>{{ radiusDraftKm }} km</strong>
          <span>Entfernung vom freigegebenen Standort</span>
        </div>
        <label class="radius-slider">
          <span class="sr-only">Suchradius in Kilometern</span>
          <input
            v-model.number="radiusDraftKm"
            type="range"
            min="1"
            max="100"
            step="1"
            :style="{ '--radius-progress': radiusProgress + '%' }"
            :aria-valuetext="radiusDraftKm + ' Kilometer'"
          />
          <span class="radius-slider-scale" aria-hidden="true"><span>1 km</span><span>100 km</span></span>
        </label>

        <p v-if="geolocationError" class="radius-error" role="alert">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" aria-hidden="true" />
          {{ geolocationError }}
        </p>

        <button v-if="filters.nearbyOnly" class="clear-filters radius-disable" type="button" @click="disableNearbyFilter">
          Nähefilter deaktivieren
        </button>

        <div class="sheet-actions">
          <button class="secondary-action" type="button" @click="closeRadiusPicker">Abbrechen</button>
          <button class="primary-action" type="button" :disabled="isLocationBusy" @click="applyNearbyRadius">
            <font-awesome-icon :icon="isLocationBusy ? ['fas', 'spinner'] : ['fas', 'location-dot']" :class="{ 'is-spinning': isLocationBusy }" aria-hidden="true" />
            {{ isLocationBusy ? 'Standort wird ermittelt …' : userLocation ? 'Umkreis anwenden' : 'Standort freigeben' }}
          </button>
        </div>
      </section>
        </div>

        <div v-if="selectedGame" class="modal-backdrop" @click.self="closeGame">
      <section class="game-detail-sheet" :class="{ 'game-detail-sheet--at-risk': selectedGame.isAtRisk }" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title">
        <button class="detail-close icon-button icon-button--subtle" type="button" aria-label="Details schließen" @click="closeGame">
          <font-awesome-icon :icon="['fas', 'xmark']" aria-hidden="true" />
        </button>
        <div class="detail-accent" :class="'detail-accent--' + selectedGame.accent"></div>
        <div class="detail-content">
          <div class="detail-header detail-header--compact">
            <time class="detail-date" :datetime="selectedGame.date">
              <span class="detail-date-day">
                <font-awesome-icon :icon="['fas', 'calendar-days']" aria-hidden="true" />
                {{ selectedGame.weekday }}., {{ selectedGame.day }}. {{ selectedGame.month }}
              </span>
              <span class="detail-date-time">
                <font-awesome-icon :icon="['fas', 'clock']" aria-hidden="true" />
                {{ selectedGame.time }} Uhr
              </span>
            </time>
            <GameRiskBadge v-if="selectedGame.isAtRisk" />
          </div>
          <p class="eyebrow">{{ selectedGame.league }}</p>
          <h2 id="game-dialog-title">{{ selectedGame.homeTeam }} <span>vs</span> {{ selectedGame.awayTeam }}</h2>
          <div class="detail-location">
            <span class="detail-location-copy">
              <font-awesome-icon :icon="['fas', 'location-dot']" aria-hidden="true" />
              {{ selectedGame.venue }}, {{ selectedGame.city }}
            </span>
            <a
              class="detail-map-link"
              :href="getGoogleMapsUrl(selectedGame)"
              target="_blank"
              rel="noopener noreferrer"
              title="Halle in Google Maps öffnen"
            >
              <font-awesome-icon :icon="['fas', 'map-location-dot']" aria-hidden="true" />
              <span>Google Maps</span>
            </a>
          </div>

          <div class="detail-info-grid">
            <div><span class="detail-info-icon"><font-awesome-icon :icon="['fas', 'clock']" aria-hidden="true" /></span><span><small>Beginn</small><strong>{{ selectedGame.time }} Uhr</strong></span></div>
            <div v-if="userLocation && Number.isFinite(selectedGame.distanceKm)"><span class="detail-info-icon"><font-awesome-icon :icon="['fas', 'route']" aria-hidden="true" /></span><span><small>Entfernung</small><strong>{{ selectedGame.distance }}</strong></span></div>
            <div><span class="detail-info-icon"><font-awesome-icon :icon="['fas', 'id-card']" aria-hidden="true" /></span><span><small>Lizenzstufe</small><span class="detail-license-chip">{{ selectedGame.license }}</span></span></div>
          </div>

          <RefereeAssignments class="detail-referees" :assignments="selectedGame.refereeAssignments" layout="detail" />

          <div class="detail-note">
            <font-awesome-icon :icon="['fas', 'circle-info']" aria-hidden="true" />
            <p>Mit „Übernehmen“ wirst du zu Team-SL weitergeleitet. Dort meldest du dich mit deinen eigenen Zugangsdaten an und übernimmst das Spiel direkt.</p>
          </div>
        </div>
        <div class="detail-footer">
          <a
            class="primary-action primary-action--wide"
            :href="getTeamSlTakeUrl(selectedGame)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <font-awesome-icon :icon="['fas', 'handshake']" aria-hidden="true" />
            Übernehmen
          </a>
        </div>
      </section>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GamesService from '@/services/games.service.js'
import RefereeAssignments from '@/components/games/RefereeAssignments.vue'
import GameRiskBadge from '@/components/games/GameRiskBadge.vue'
import { getRefereeAssignments, isGameAtRisk } from '@/utils/refereeAssignments.js'
import {
  formatDistanceKm,
  parseDistanceKm,
  requestUserLocation
} from '@/services/geolocation.service.js'
import { compareGamesByDateVenueTime } from '@/utils/gameSorting.js'

const THEME_STORAGE_KEY = 'srbasar-design-mvp-theme'
const DEFAULT_SORT_BY = 'date'
const DEFAULT_SORT_DIRECTION = 'ASC'
const githubFrontendUrl = import.meta.env.VITE_GITHUB_FRONTEND_URL || 'https://github.com/dirkdrutschmann/srbasar-frontend'
const githubBackendUrl = import.meta.env.VITE_GITHUB_BACKEND_URL || 'https://github.com/dirkdrutschmann/srbasar-backend'
const paypalSupportUrl = import.meta.env.VITE_PAYPAL_SUPPORT_URL || 'https://www.paypal.com/donate'

const quickFilters = [
  { id: 'nearby', label: 'In deiner Nähe', icon: ['fas', 'location-dot'] },
  { id: 'weekend', label: 'Dieses Wochenende', icon: ['fas', 'calendar-days'] },
  { id: 'atRisk', label: 'Ausfall bedroht', icon: ['fas', 'triangle-exclamation'] }
]

const filterDefinitions = [
  { id: 'date', label: 'Termin', searchLabel: 'Termine suchen', searchPlaceholder: 'Termin suchen …' },
  { id: 'league', label: 'Liga', searchLabel: 'Ligen suchen', searchPlaceholder: 'Liga suchen …' },
  { id: 'venue', label: 'Hallen', multiple: true, searchLabel: 'Hallen suchen', searchPlaceholder: 'Halle suchen …' },
  { id: 'license', label: 'Lizenzstufe', searchLabel: 'Lizenzstufen suchen', searchPlaceholder: 'Lizenzstufe suchen …' }
]

const tableColumns = [
  { id: 'date', label: 'Termin', sortKey: 'date', icon: ['fas', 'calendar-days'], sortable: true },
  { id: 'venue', label: 'Halle', sortKey: 'venue', icon: ['fas', 'location-dot'], sortable: true },
  { id: 'league', label: 'Liga', sortKey: 'league', icon: ['fas', 'trophy'], sortable: true },
  { id: 'homeTeam', label: 'Heimteam', sortKey: 'homeTeam', icon: ['fas', 'house'], sortable: true },
  { id: 'awayTeam', label: 'Gastteam', sortKey: 'awayTeam', icon: ['fas', 'plane-departure'], sortable: true },
  { id: 'license', label: 'Lizenz', sortKey: 'license', icon: ['fas', 'id-card'], sortable: true },
  { id: 'distance', label: 'Entfernung', sortKey: 'distance', icon: ['fas', 'route'], sortable: true, locationOnly: true }
]

const mockGames = [
  {
    id: 1,
    date: '2026-09-12T10:00:00',
    dateGroup: 'Dieses Wochenende',
    weekday: 'Sa',
    day: '12',
    month: 'SEP',
    time: '10:00',
    startsIn: 'in 2 Tagen',
    license: 'LSE+',
    league: 'Regionalliga Herren',
    homeTeam: 'SG Nord',
    awayTeam: 'Basketball Löwen',
    venue: 'Sporthalle Nord',
    city: 'Braunschweig',
    distance: '3,2 km',
    distanceKm: 3.2,
    gameType: 'Herren',
    nearby: true,
    accent: 'orange'
  },
  {
    id: 2,
    date: '2026-09-13T14:30:00',
    dateGroup: 'Dieses Wochenende',
    weekday: 'So',
    day: '13',
    month: 'SEP',
    time: '14:30',
    startsIn: 'in 3 Tagen',
    license: 'LSD',
    league: 'Oberliga Damen',
    homeTeam: 'USC Braunschweig',
    awayTeam: 'MTV Wolfenbüttel',
    venue: 'Arena Süd',
    city: 'Braunschweig',
    distance: '8,7 km',
    distanceKm: 8.7,
    gameType: 'Damen',
    nearby: true,
    accent: 'blue'
  },
  {
    id: 3,
    date: '2026-09-19T16:00:00',
    dateGroup: 'Nächste Woche',
    weekday: 'Sa',
    day: '19',
    month: 'SEP',
    time: '16:00',
    startsIn: 'in 9 Tagen',
    license: 'LSE',
    league: 'Landesliga U18',
    homeTeam: 'BC City',
    awayTeam: 'TSV Rüningen',
    venue: 'City Dome',
    city: 'Salzgitter',
    distance: '21,4 km',
    distanceKm: 21.4,
    gameType: 'Jugend',
    nearby: false,
    accent: 'violet'
  },
  {
    id: 4,
    date: '2026-09-20T11:30:00',
    dateGroup: 'Nächste Woche',
    weekday: 'So',
    day: '20',
    month: 'SEP',
    time: '11:30',
    startsIn: 'in 10 Tagen',
    license: 'LSE',
    league: 'Bezirksliga Herren',
    homeTeam: 'Lehndorfer TSV',
    awayTeam: 'SG Südheide',
    venue: 'Sporthalle Nord',
    city: 'Braunschweig',
    distance: '5,1 km',
    distanceKm: 5.1,
    gameType: 'Herren',
    nearby: true,
    accent: 'green'
  }
].map((game, index) => {
  const refereeData = {
    sr1VereinName: game.homeTeam,
    sr2VereinName: game.awayTeam,
    sr1OffenAngeboten: true,
    sr2OffenAngeboten: index === 0,
    sr1: false,
    sr2: index !== 0
  }
  return {
    ...game,
    accent: getDateAccent(new Date(game.date)),
    refereeAssignments: getRefereeAssignments(refereeData),
    isAtRisk: isGameAtRisk(refereeData)
  }
})

const defaultFilters = {
  date: 'Alle Termine',
  dateValue: '',
  league: 'Alle Ligen',
  venue: [],
  license: 'Alle Lizenzstufen',
  nearbyOnly: false,
  atRiskOnly: false
}

function createDefaultFilters() {
  return { ...defaultFilters, venue: [] }
}

const search = ref('')
const sortBy = ref(DEFAULT_SORT_BY)
const sortDirection = ref(DEFAULT_SORT_DIRECTION)
const viewMode = ref('list')
const isTableViewAvailable = ref(true)
const effectiveViewMode = computed(() => isTableViewAvailable.value ? viewMode.value : 'cards')
const previewMode = ref('success')
const dataSourceMode = ref('live')
const liveApiStatus = ref('idle')
const liveApiError = ref('')
const liveGames = ref([])
const livePagination = ref({ totalItems: 0 })
const PAGE_SIZE = 20
const currentPage = ref(1)
const liveAvailableFilters = ref({})
const isFilterSheetOpen = ref(false)
const openFilterDropdown = ref(null)
const filterDropdownSearch = ref('')
const filterDropdownSearchInput = ref(null)
const filterDropdownPosition = reactive({ top: 0, left: 0, width: 0, maxHeight: 320 })
const filterTriggerElements = new Map()
const isImprintOpen = ref(false)
const isSupportOpen = ref(false)
const isGithubTooltipOpen = ref(false)
const selectedGame = ref(null)
const isRefreshing = ref(false)
const lastUpdated = ref('wird geladen')
const AUTO_UPDATE_SECONDS = 30
const autoUpdateEnabled = ref(true)
const countdown = ref(AUTO_UPDATE_SECONDS)
const countdownProgress = ref(AUTO_UPDATE_SECONDS)
const pollingInterval = ref(null)
const countdownAnimationFrame = ref(null)
let countdownDeadline = 0
const geolocationStatus = ref('idle')
const geolocationError = ref('')
const userLocation = ref(null)
const filters = reactive(createDefaultFilters())
const theme = ref(getInitialTheme())
const RADIUS_MIN_KM = 1
const RADIUS_MAX_KM = 100
const selectedRadiusKm = ref(25)
const radiusDraftKm = ref(selectedRadiusKm.value)
const isRadiusPickerOpen = ref(false)
const visibleTableColumns = computed(() => tableColumns.filter((column) => !column.locationOnly || userLocation.value))
const todayDateInputValue = getDateInputValue(new Date())
const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const calendarWeekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
let liveQueryTimer = null
let liveRequestSequence = 0

const currentGames = computed(() => dataSourceMode.value === 'live' ? liveGames.value : mockGames)

const atRiskCount = computed(() => dataSourceMode.value === 'live'
  ? Number(liveAvailableFilters.value.atRiskCount) || 0
  : mockGames.filter((game) => game.isAtRisk).length
)
const hasAtRiskGames = computed(() => atRiskCount.value > 0)
const visibleQuickFilters = computed(() => quickFilters.filter((filter) => (
  filter.id !== 'atRisk' || hasAtRiskGames.value || filters.atRiskOnly
)))

const filterOptions = computed(() => {
  const games = currentGames.value
  const uniqueValues = (values) => [...new Set(values.filter(Boolean))].sort((firstValue, secondValue) => firstValue.localeCompare(secondValue, 'de'))
  const apiFilters = liveAvailableFilters.value || {}
  const liveOptions = (key, fallbackValues) => dataSourceMode.value === 'live' && Array.isArray(apiFilters[key])
    ? apiFilters[key]
    : fallbackValues

  return {
    date: ['Alle Termine', 'Diese Woche', 'Dieses Wochenende', 'Nächste Woche', 'Bestimmtes Datum'],
    league: ['Alle Ligen', ...uniqueValues(liveOptions('ligaName', games.map((game) => game.league)))],
    venue: uniqueValues(liveOptions('spielfeldName', games.map((game) => game.venue))),
    license: ['Alle Lizenzstufen', ...uniqueValues(liveOptions('srLizenz', games.map((game) => game.license)))]
  }
})

const isLocationBusy = computed(() => geolocationStatus.value === 'requesting')
const radiusProgress = computed(() => (
  Math.max(0, Math.min(100, ((radiusDraftKm.value - RADIUS_MIN_KM) / (RADIUS_MAX_KM - RADIUS_MIN_KM)) * 100))
))

const calendarMonthLabel = computed(() => new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric'
}).format(calendarMonth.value))

const canGoToPreviousCalendarMonth = computed(() => {
  const today = new Date()
  const currentMonth = today.getFullYear() * 12 + today.getMonth()
  const selectedMonth = calendarMonth.value.getFullYear() * 12 + calendarMonth.value.getMonth()
  return selectedMonth > currentMonth
})

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const mondayBasedOffset = (firstDayOfMonth.getDay() + 6) % 7
  const firstVisibleDay = addDays(firstDayOfMonth, -mondayBasedOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisibleDay, index)
    const value = getDateInputValue(date)
    return {
      value,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: value === todayDateInputValue,
      isSelected: value === filters.dateValue,
      isDisabled: value < todayDateInputValue
    }
  })
})

const filterDropdownMenuStyle = computed(() => ({
  top: filterDropdownPosition.top + 'px',
  left: filterDropdownPosition.left + 'px',
  width: filterDropdownPosition.width + 'px',
  '--filter-dropdown-max-height': filterDropdownPosition.maxHeight + 'px'
}))

function compareDateAndVenue(firstGame, secondGame) {
  return compareGamesByDateVenueTime(firstGame, secondGame)
}

function compareGames(firstGame, secondGame) {
  if (sortBy.value === DEFAULT_SORT_BY) {
    return compareGamesByDateVenueTime(firstGame, secondGame, sortDirection.value)
  }

  let primaryDifference = 0

  if (sortBy.value === 'distance' && userLocation.value) {
    primaryDifference = (firstGame.distanceKm ?? Number.POSITIVE_INFINITY) - (secondGame.distanceKm ?? Number.POSITIVE_INFINITY)
  } else if (sortBy.value === 'league') {
    primaryDifference = String(firstGame.league || '').localeCompare(String(secondGame.league || ''), 'de-DE', {
      numeric: true,
      sensitivity: 'base'
    })
  } else if (sortBy.value === 'venue') {
    primaryDifference = String(firstGame.venue || '').localeCompare(String(secondGame.venue || ''), 'de-DE', {
      numeric: true,
      sensitivity: 'base'
    })
  } else if (sortBy.value === 'homeTeam') {
    primaryDifference = String(firstGame.homeTeam || '').localeCompare(String(secondGame.homeTeam || ''), 'de-DE', {
      numeric: true,
      sensitivity: 'base'
    })
  } else if (sortBy.value === 'awayTeam') {
    primaryDifference = String(firstGame.awayTeam || '').localeCompare(String(secondGame.awayTeam || ''), 'de-DE', {
      numeric: true,
      sensitivity: 'base'
    })
  } else if (sortBy.value === 'license') {
    primaryDifference = String(firstGame.license || '').localeCompare(String(secondGame.license || ''), 'de-DE', {
      numeric: true,
      sensitivity: 'base'
    })
  } else {
    primaryDifference = new Date(firstGame.date).getTime() - new Date(secondGame.date).getTime()
  }

  const direction = sortDirection.value === 'DESC' ? -1 : 1
  return (primaryDifference * direction) || compareDateAndVenue(firstGame, secondGame)
}

const filteredGames = computed(() => {
  if (dataSourceMode.value === 'live') return liveGames.value

  const searchTerm = search.value.trim().toLowerCase()
  const results = mockGames.filter((game) => {
    const searchableContent = [game.homeTeam, game.awayTeam, game.venue, game.city, game.league].join(' ').toLowerCase()
    const matchesSearch = !searchTerm || searchableContent.includes(searchTerm)
    const matchesDate = filters.date === defaultFilters.date
      || (filters.date === 'Bestimmtes Datum' && (!filters.dateValue || getDateInputValue(new Date(game.date)) === filters.dateValue))
      || game.dateGroup === filters.date
    const matchesLeague = filters.league === defaultFilters.league || game.league === filters.league
    const matchesVenue = !filters.venue.length || filters.venue.includes(game.venue)
    const matchesLicense = filters.license === defaultFilters.license || game.license === filters.license
    const matchesNearby = !filters.nearbyOnly || (
      Number.isFinite(game.distanceKm)
        ? game.distanceKm <= selectedRadiusKm.value
        : game.nearby
    )

    const matchesRisk = !filters.atRiskOnly || game.isAtRisk
    return matchesSearch && matchesDate && matchesLeague && matchesVenue && matchesLicense && matchesNearby && matchesRisk
  })

  return [...results].sort(compareGames)
})

const resultCount = computed(() => {
  if (dataSourceMode.value === 'live' && Number.isFinite(Number(livePagination.value?.totalItems))) {
    return Number(livePagination.value.totalItems)
  }

  return filteredGames.value.length
})

const totalPages = computed(() => {
  if (dataSourceMode.value === 'live') {
    const serverTotalPages = Number(livePagination.value?.totalPages)
    if (Number.isInteger(serverTotalPages) && serverTotalPages > 0) return serverTotalPages
  }

  return Math.max(1, Math.ceil(resultCount.value / PAGE_SIZE))
})

const visibleGames = computed(() => {
  if (dataSourceMode.value === 'live') return [...liveGames.value].sort(compareGames)

  const startIndex = (currentPage.value - 1) * PAGE_SIZE
  return filteredGames.value.slice(startIndex, startIndex + PAGE_SIZE)
})

const paginationStart = computed(() => (
  resultCount.value ? (currentPage.value - 1) * PAGE_SIZE + 1 : 0
))

const paginationEnd = computed(() => (
  Math.min(currentPage.value * PAGE_SIZE, resultCount.value)
))

const paginationItems = computed(() => {
  const pageCount = totalPages.value
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => ({
      key: 'page-' + (index + 1),
      type: 'page',
      page: index + 1
    }))
  }

  const pages = new Set([1, pageCount, currentPage.value - 1, currentPage.value, currentPage.value + 1])
  const sortedPages = [...pages].filter((page) => page > 0 && page <= pageCount).sort((a, b) => a - b)
  const items = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]
    if (previousPage && page - previousPage > 1) {
      items.push({ key: 'ellipsis-' + previousPage, type: 'ellipsis' })
    }
    items.push({ key: 'page-' + page, type: 'page', page })
  })

  return items
})

const liveQueryState = computed(() => ({
  search: search.value.trim(),
  date: filters.date,
  dateValue: filters.dateValue,
  league: filters.league,
  venue: [...filters.venue],
  license: filters.license,
  nearbyOnly: filters.nearbyOnly,
  atRiskOnly: filters.atRiskOnly,
  radiusKm: selectedRadiusKm.value,
  location: userLocation.value
    ? [userLocation.value.latitude, userLocation.value.longitude]
    : null,
  sortBy: sortBy.value,
  sortDirection: sortDirection.value
}))

watch(liveQueryState, () => {
  currentPage.value = 1
  if (dataSourceMode.value !== 'live') return

  if (liveQueryTimer) window.clearTimeout(liveQueryTimer)
  liveQueryTimer = window.setTimeout(() => {
    liveQueryTimer = null
    loadLiveGames()
  }, 250)
}, { deep: true })

watch(openFilterDropdown, async (filterId) => {
  removeFilterDropdownViewportListeners()
  if (!filterId) return

  await nextTick()
  updateFilterDropdownPosition()
  window.addEventListener('resize', updateFilterDropdownPosition)
  window.addEventListener('scroll', updateFilterDropdownPosition, true)
})

const activeFilterLabels = computed(() => {
  const labels = []
  if (filters.date !== defaultFilters.date) {
    labels.push({
      key: 'date',
      label: filters.date === 'Bestimmtes Datum' && filters.dateValue
        ? formatDisplayDate(filters.dateValue)
        : filters.date
    })
  }
  if (filters.league !== defaultFilters.league) labels.push({ key: 'league', label: filters.league })
  if (filters.venue.length) {
    labels.push({
      key: 'venue',
      label: filters.venue.length === 1 ? filters.venue[0] : filters.venue.length + ' Hallen'
    })
  }
  if (filters.license !== defaultFilters.license) labels.push({ key: 'license', label: filters.license })
  if (filters.nearbyOnly) labels.push({ key: 'nearbyOnly', label: 'In deiner Nähe · ' + selectedRadiusKm.value + ' km' })
  if (filters.atRiskOnly) labels.push({ key: 'atRiskOnly', label: 'Ausfall bedroht' })
  return labels
})

const filterCount = computed(() => activeFilterLabels.value.length)

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme
  } catch {
    // Private browsing modes can deny access to localStorage. The system preference still works.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getGameDate(game) {
  const timestamp = Number(game.spieldatum)
  if (Number.isFinite(timestamp) && timestamp > 0) {
    const milliseconds = timestamp < 100000000000 ? timestamp * 1000 : timestamp
    const dateFromTimestamp = new Date(milliseconds)
    if (!Number.isNaN(dateFromTimestamp.getTime())) return dateFromTimestamp
  }

  const dateParts = String(game.datum || '').split('.')
  if (dateParts.length !== 3) return null

  const [day, month, year] = dateParts.map(Number)
  const [hours, minutes] = String(game.zeit || '00:00').split(':').map(Number)
  const fallbackDate = new Date(year, month - 1, day, hours || 0, minutes || 0)
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate
}

function getDateGroup(date) {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const gameDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDifference = Math.round((gameDay - todayStart) / 86400000)

  if (dayDifference < 0) return 'Vergangen'
  if (dayDifference <= 6 && [0, 5, 6].includes(gameDay.getDay())) return 'Dieses Wochenende'
  if (dayDifference <= 6) return 'Diese Woche'
  if (dayDifference <= 13) return 'Nächste Woche'
  return 'Später'
}

function getDateAccent(date) {
  const dateKey = getDateInputValue(date)
  const dateNumber = Number(dateKey.replace(/-/g, ''))
  const accentIndex = Number.isFinite(dateNumber) ? dateNumber % 4 : 0
  return ['orange', 'blue', 'violet', 'green'][accentIndex]
}

function getDateParts(date) {
  const parts = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'Europe/Berlin'
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    weekday: values.weekday.replace('.', '').slice(0, 2),
    day: values.day,
    month: values.month.replace('.', '').slice(0, 3).toUpperCase()
  }
}

function getDateInputValue(date) {
  const parts = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Berlin'
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return values.year + '-' + values.month + '-' + values.day
}

function formatDisplayDate(value) {
  const [year, month, day] = String(value).split('-')
  if (!year || !month || !day) return value
  return day + '.' + month + '.' + year
}

function parseDateInputValue(value) {
  const [year, month, day] = String(value).split('-').map(Number)
  if (![year, month, day].every(Number.isInteger)) return null

  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null
}

function formatCalendarDate(value) {
  const date = parseDateInputValue(value)
  if (!date) return 'Bitte Datum wählen'

  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function changeCalendarMonth(monthOffset) {
  const nextMonth = new Date(
    calendarMonth.value.getFullYear(),
    calendarMonth.value.getMonth() + monthOffset,
    1
  )

  if (monthOffset < 0 && !canGoToPreviousCalendarMonth.value) return
  calendarMonth.value = nextMonth
}

function selectCalendarDate(value) {
  if (value < todayDateInputValue) return
  filters.dateValue = value
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function getDateRangeForServer() {
  if (filters.date === defaultFilters.date) return {}

  if (filters.date === 'Bestimmtes Datum') {
    return filters.dateValue
      ? { date: filters.dateValue }
      : {}
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (filters.date === 'Später') {
    return { dateFrom: getDateInputValue(addDays(todayStart, 14)) }
  }

  if (filters.date === 'Nächste Woche') {
    return {
      dateFrom: getDateInputValue(addDays(todayStart, 7)),
      dateTo: getDateInputValue(addDays(todayStart, 13))
    }
  }

  if (filters.date === 'Dieses Wochenende') {
    const dayOfWeek = todayStart.getDay()
    const weekendStart = dayOfWeek === 6
      ? addDays(todayStart, -1)
      : dayOfWeek === 0
        ? todayStart
        : addDays(todayStart, (5 - dayOfWeek + 7) % 7)

    return {
      dateFrom: getDateInputValue(weekendStart),
      dateTo: getDateInputValue(addDays(weekendStart, dayOfWeek === 0 ? 0 : 2))
    }
  }

  return {
    dateFrom: getDateInputValue(todayStart),
    dateTo: getDateInputValue(addDays(todayStart, 6))
  }
}

function getLiveSortField() {
  return {
    date: 'spieldatum',
    distance: 'distance',
    league: 'ligaName',
    venue: 'spielfeldName',
    homeTeam: 'heimMannschaftName',
    awayTeam: 'gastMannschaftName',
    license: 'srLizenz'
  }[sortBy.value] || 'spieldatum'
}

function getLiveQueryParams() {
  const params = {
    ...getDateRangeForServer(),
    sortBy: userLocation.value || sortBy.value !== 'distance' ? getLiveSortField() : 'spieldatum',
    sortOrder: sortDirection.value
  }

  const searchTerm = search.value.trim()
  if (searchTerm) params.search = searchTerm
  if (filters.league !== defaultFilters.league) params.ligaName = filters.league
  if (filters.venue.length) params.spielfeldNames = filters.venue.join(',')
  if (filters.license !== defaultFilters.license) params.srLizenz = filters.license
  if (filters.atRiskOnly) params.atRiskOnly = true

  if (userLocation.value) {
    params.latitude = userLocation.value.latitude
    params.longitude = userLocation.value.longitude
  }

  if (filters.nearbyOnly && userLocation.value) {
    params.nearbyOnly = true
    params.radiusKm = selectedRadiusKm.value
  }

  return params
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC'
}

function setTableSort(sortKey) {
  if (sortBy.value === sortKey) {
    toggleSortDirection()
    return
  }

  sortBy.value = sortKey
  sortDirection.value = 'ASC'
}

function getTableSortIcon(columnId) {
  if (sortBy.value !== columnId) return ['fas', 'sort']
  return sortDirection.value === 'ASC' ? ['fas', 'chevron-up'] : ['fas', 'chevron-down']
}

function getTableAriaSort(columnId) {
  if (sortBy.value !== columnId) return 'none'
  return sortDirection.value === 'ASC' ? 'ascending' : 'descending'
}

function getTableSortLabel(column) {
  if (sortBy.value !== column.sortKey) return column.label + ' sortieren'

  const nextDirection = sortDirection.value === 'ASC' ? 'absteigend' : 'aufsteigend'
  return column.label + ' ' + nextDirection + ' sortieren'
}

function getStartsIn(date) {
  const differenceInMinutes = Math.round((date.getTime() - Date.now()) / 60000)
  if (differenceInMinutes < 0) return 'bereits gestartet'
  if (differenceInMinutes < 60) return 'in ' + differenceInMinutes + ' Min.'

  const differenceInDays = Math.floor(differenceInMinutes / 1440)
  if (differenceInDays === 0) return 'heute'
  if (differenceInDays === 1) return 'morgen'
  return 'in ' + differenceInDays + ' Tagen'
}

function getGameType(game) {
  const league = String(game.ligaName || '').toLowerCase()
  if (league.includes('damen') || league.includes('mädchen')) return 'Damen'
  if (league.includes('u1') || league.includes('jugend') || league.includes('junior')) return 'Jugend'
  return 'Herren'
}

function getLiveCoordinates(game) {
  const coordinateSource = game.coordinates || game.location || {}
  const latitude = Number(
    coordinateSource.latitude
      ?? coordinateSource.lat
      ?? game.latitude
      ?? game.lat
      ?? game.spielfeldLatitude
      ?? game.spielLatitude
      ?? game.breitengrad
  )
  const longitude = Number(
    coordinateSource.longitude
      ?? coordinateSource.lng
      ?? coordinateSource.lon
      ?? game.longitude
      ?? game.lng
      ?? game.lon
      ?? game.spielfeldLongitude
      ?? game.spielLongitude
      ?? game.laengengrad
  )

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

function normalizeLiveGame(game, index) {
  const date = getGameDate(game)
  if (!date) return null

  const dateParts = getDateParts(date)
  const venue = game.spielfeldName || 'Halle nicht angegeben'
  const city = game.spielOrt || 'Ort nicht angegeben'
  const distanceKm = parseDistanceKm(game.distanceKm)

  return {
    id: game.spielplanId || 'live-' + index,
    sourceId: game.spielplanId || null,
    date: date.toISOString(),
    dateGroup: getDateGroup(date),
    weekday: dateParts.weekday,
    day: dateParts.day,
    month: dateParts.month,
    time: game.zeit || new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date),
    startsIn: getStartsIn(date),
    license: game.srLizenz || 'Nicht angegeben',
    league: game.ligaName || 'Liga nicht angegeben',
    homeTeam: game.heimMannschaftName || 'Heimteam',
    awayTeam: game.gastMannschaftName || 'Gastteam',
    refereeAssignments: getRefereeAssignments(game),
    isAtRisk: isGameAtRisk(game),
    venue,
    city,
    address: [game.spielStrasse, game.spielPlz, game.spielOrt].filter(Boolean).join(', '),
    coordinates: getLiveCoordinates(game),
    distance: Number.isFinite(distanceKm) ? formatDistanceKm(distanceKm) : 'Entfernung unbekannt',
    distanceKm,
    gameType: getGameType(game),
    nearby: Number.isFinite(distanceKm) && distanceKm <= selectedRadiusKm.value,
    accent: getDateAccent(date)
  }
}

async function loadLiveGames() {
  dataSourceMode.value = 'live'
  liveApiStatus.value = 'loading'
  liveApiError.value = ''
  previewMode.value = 'loading'
  const requestSequence = ++liveRequestSequence

  try {
    const response = await GamesService.getSpieleOrThrow({
      page: currentPage.value,
      limit: PAGE_SIZE,
      ...getLiveQueryParams()
    })

    if (requestSequence !== liveRequestSequence) return

    if (!response?.success) {
      throw new Error(response?.error || 'Die Live-API hat keine gültige Antwort geliefert.')
    }

    const payload = response.data || {}
    const sourceGames = Array.isArray(payload.spiele) ? payload.spiele : []
    liveGames.value = sourceGames.map(normalizeLiveGame).filter(Boolean)
    livePagination.value = payload.pagination || { totalItems: sourceGames.length }
    liveAvailableFilters.value = payload.availableFilters || {}
    if (filters.atRiskOnly && liveAvailableFilters.value.atRiskCount === 0) {
      filters.atRiskOnly = false
    }
    liveApiStatus.value = 'success'
    previewMode.value = 'success'
    lastUpdated.value = 'gerade eben'
  } catch (error) {
    if (requestSequence !== liveRequestSequence) return
    liveApiStatus.value = 'error'
    liveApiError.value = error?.message || 'Die Live-API ist momentan nicht erreichbar.'
    previewMode.value = 'error'
  }
}

async function requestNearbyLocation() {
  if (isLocationBusy.value) return false

  geolocationStatus.value = 'requesting'
  geolocationError.value = ''
  try {
    userLocation.value = await requestUserLocation()
    geolocationStatus.value = 'ready'
    return true
  } catch (error) {
    geolocationStatus.value = error?.message?.includes('abgelehnt') ? 'denied' : 'error'
    geolocationError.value = error?.message || 'Der Standort konnte nicht ermittelt werden.'
    return false
  }
}

function openNearbyRadiusPicker() {
  radiusDraftKm.value = selectedRadiusKm.value
  geolocationError.value = ''
  closeFilterSheet()
  isRadiusPickerOpen.value = true
}

function closeRadiusPicker() {
  isRadiusPickerOpen.value = false
}

async function applyNearbyRadius() {
  if (isLocationBusy.value) return

  const locationReady = userLocation.value || await requestNearbyLocation()
  if (!locationReady) return

  selectedRadiusKm.value = radiusDraftKm.value
  filters.nearbyOnly = true
  closeRadiusPicker()
}

function disableNearbyFilter() {
  filters.nearbyOnly = false
  closeRadiusPicker()
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme.value)
  } catch {
    // The visual preference remains active for this session if storage is unavailable.
  }
}

function getQuickFilterLabel(filter) {
  if (filter.id === 'nearby' && filters.nearbyOnly) return filter.label + ' · ' + selectedRadiusKm.value + ' km'
  return filter.label
}

function setFilterTriggerRef(filterId, element) {
  if (element) {
    filterTriggerElements.set(filterId, element)
    return
  }

  filterTriggerElements.delete(filterId)
}

function updateFilterDropdownPosition() {
  if (typeof window === 'undefined' || !openFilterDropdown.value) return

  const trigger = filterTriggerElements.get(openFilterDropdown.value)
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const viewportPadding = 12
  const width = Math.min(
    Math.max(rect.width, 240),
    Math.max(0, window.innerWidth - viewportPadding * 2)
  )
  const left = Math.min(
    Math.max(rect.left, viewportPadding),
    Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
  )
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
  const spaceAbove = rect.top - viewportPadding
  const opensAbove = spaceBelow < 260 && spaceAbove >= spaceBelow
  const availableSpace = opensAbove ? spaceAbove : spaceBelow
  const maxHeight = Math.max(120, Math.min(360, availableSpace - 6))

  filterDropdownPosition.top = opensAbove
    ? Math.max(viewportPadding, rect.top - maxHeight - 6)
    : rect.bottom + 6
  filterDropdownPosition.left = left
  filterDropdownPosition.width = width
  filterDropdownPosition.maxHeight = maxHeight
}

function removeFilterDropdownViewportListeners() {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updateFilterDropdownPosition)
  window.removeEventListener('scroll', updateFilterDropdownPosition, true)
}

function isFilterDefault(filterId) {
  if (filterId === 'venue') return !filters.venue.length
  return filters[filterId] === defaultFilters[filterId]
}

function getFilterDisplayLabel(filterId) {
  if (filterId === 'date' && filters.date === 'Bestimmtes Datum' && filters.dateValue) {
    return formatDisplayDate(filters.dateValue)
  }
  if (filterId === 'venue') {
    if (!filters.venue.length) return 'Alle Hallen'
    return filters.venue.length === 1 ? filters.venue[0] : filters.venue.length + ' Hallen'
  }
  return filters[filterId]
}

function getFilterOptions(filter) {
  const options = filterOptions.value[filter.id] || []
  const searchTerm = filterDropdownSearch.value.trim().toLowerCase()
  if (!searchTerm) return options
  return options.filter((option) => option.toLowerCase().includes(searchTerm))
}

function isFilterOptionSelected(filterId, option) {
  return filterId === 'venue' ? filters.venue.includes(option) : filters[filterId] === option
}

async function toggleFilterDropdown(filterId) {
  if (openFilterDropdown.value === filterId) {
    closeFilterDropdown()
    return
  }

  openFilterDropdown.value = filterId
  filterDropdownSearch.value = ''
  await nextTick()
  const input = Array.isArray(filterDropdownSearchInput.value)
    ? filterDropdownSearchInput.value[0]
    : filterDropdownSearchInput.value
  input?.focus()
}

function closeFilterDropdown() {
  openFilterDropdown.value = null
  filterDropdownSearch.value = ''
}

function closeFilterSheet() {
  isFilterSheetOpen.value = false
  closeFilterDropdown()
}

function selectFilterOption(filterId, option) {
  if (filterId === 'venue') {
    const selectedIndex = filters.venue.indexOf(option)
    if (selectedIndex === -1) {
      filters.venue.push(option)
    } else {
      filters.venue.splice(selectedIndex, 1)
    }
    return
  }

  filters[filterId] = option
  if (filterId === 'date' && option !== 'Bestimmtes Datum') filters.dateValue = ''
  closeFilterDropdown()
}

function clearVenueFilter() {
  filters.venue.splice(0)
  closeFilterDropdown()
}

function isQuickFilterActive(filterId) {
  if (filterId === 'atRisk') return filters.atRiskOnly
  if (filterId === 'nearby') return filters.nearbyOnly
  if (filterId === 'weekend') return filters.date === 'Dieses Wochenende'
  return false
}

function toggleQuickFilter(filterId) {
  if (filterId === 'atRisk') {
    if (hasAtRiskGames.value || filters.atRiskOnly) filters.atRiskOnly = !filters.atRiskOnly
    return
  }
  if (filterId === 'nearby') {
    openNearbyRadiusPicker()
    return
  }
  if (filterId === 'weekend') {
    filters.date = filters.date === 'Dieses Wochenende' ? defaultFilters.date : 'Dieses Wochenende'
  }
}

function removeFilter(filterKey) {
  if (filterKey === 'nearbyOnly') {
    filters.nearbyOnly = false
    return
  }
  if (filterKey === 'venue') {
    clearVenueFilter()
    return
  }
  if (filterKey === 'date') {
    filters.date = defaultFilters.date
    filters.dateValue = ''
    return
  }
  filters[filterKey] = defaultFilters[filterKey]
}

function clearFilters() {
  search.value = ''
  currentPage.value = 1
  Object.assign(filters, createDefaultFilters())
  closeFilterDropdown()
}

function startAutoUpdate() {
  stopAutoUpdate()
  if (!autoUpdateEnabled.value) return

  resetCountdown()
  pollingInterval.value = window.setInterval(() => {
    if (dataSourceMode.value !== 'live' || liveApiStatus.value === 'loading') return
    refreshGames()
  }, AUTO_UPDATE_SECONDS * 1000)
}

function stopAutoUpdate() {
  if (pollingInterval.value) {
    window.clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
  if (countdownAnimationFrame.value !== null) {
    window.cancelAnimationFrame(countdownAnimationFrame.value)
    countdownAnimationFrame.value = null
  }
  countdownDeadline = 0
}

function animateCountdown(timestamp) {
  if (!autoUpdateEnabled.value || !countdownDeadline) return

  const remainingSeconds = Math.max(0, (countdownDeadline - timestamp) / 1000)
  countdownProgress.value = remainingSeconds
  countdown.value = Math.ceil(remainingSeconds)

  if (remainingSeconds > 0) {
    countdownAnimationFrame.value = window.requestAnimationFrame(animateCountdown)
    return
  }

  countdownAnimationFrame.value = null
}

function resetCountdown() {
  countdownDeadline = performance.now() + AUTO_UPDATE_SECONDS * 1000
  countdownProgress.value = AUTO_UPDATE_SECONDS
  countdown.value = AUTO_UPDATE_SECONDS

  if (!autoUpdateEnabled.value) return
  if (countdownAnimationFrame.value !== null) {
    window.cancelAnimationFrame(countdownAnimationFrame.value)
  }
  countdownAnimationFrame.value = window.requestAnimationFrame(animateCountdown)
}

function toggleAutoUpdate() {
  if (autoUpdateEnabled.value) {
    startAutoUpdate()
  } else {
    stopAutoUpdate()
  }
}

async function goToPage(page) {
  const requestedPage = Number(page)
  if (!Number.isInteger(requestedPage)) return

  const nextPage = Math.max(1, Math.min(requestedPage, totalPages.value))
  if (nextPage === currentPage.value) return

  currentPage.value = nextPage
  if (dataSourceMode.value === 'live') await loadLiveGames()
}

async function refreshGames() {
  if (dataSourceMode.value === 'live') {
    isRefreshing.value = true
    try {
      await loadLiveGames()
    } finally {
      isRefreshing.value = false
      resetCountdown()
    }
    return
  }

  isRefreshing.value = true
  previewMode.value = 'loading'
  window.setTimeout(() => {
    isRefreshing.value = false
    previewMode.value = 'success'
    lastUpdated.value = 'gerade eben'
  }, 650)
}

async function retryPreview() {
  if (dataSourceMode.value === 'live') {
    await loadLiveGames()
    return
  }

  previewMode.value = 'loading'
  window.setTimeout(() => {
    previewMode.value = 'success'
  }, 500)
}

function openGame(game) {
  selectedGame.value = game
}

function closeGame() {
  selectedGame.value = null
}

function closeOverlays() {
  closeFilterSheet()
  isRadiusPickerOpen.value = false
  isImprintOpen.value = false
  isSupportOpen.value = false
  isGithubTooltipOpen.value = false
  selectedGame.value = null
}

function getTeamSlTakeUrl(game) {
  const gameId = game.sourceId ?? game.id
  return 'https://www.basketball-bund.net/app.do?app=/sr/take&spielId=' + encodeURIComponent(gameId)
}

function getGoogleMapsUrl(game) {
  const coordinates = game.coordinates
  const query = coordinates
    ? coordinates.latitude + ',' + coordinates.longitude
    : [game.venue, game.address, game.city].filter(Boolean).join(', ')

  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query)
}

function updateTableViewAvailability() {
  isTableViewAvailable.value = window.matchMedia('(min-width: 900px)').matches
}

onMounted(loadLiveGames)
onMounted(startAutoUpdate)
onMounted(() => {
  updateTableViewAvailability()
  window.addEventListener('resize', updateTableViewAvailability)
})
onUnmounted(() => {
  stopAutoUpdate()
  removeFilterDropdownViewportListeners()
  window.removeEventListener('resize', updateTableViewAvailability)
})
</script>

<style scoped>
.design-mvp {
  --mvp-bg: #f4f7fb;
  --mvp-surface: rgba(255, 255, 255, 0.86);
  --mvp-surface-solid: #ffffff;
  --mvp-surface-muted: #eef3f9;
  --mvp-surface-strong: #e5ebf3;
  --mvp-text: #15243a;
  --mvp-text-soft: #64748b;
  --mvp-text-faint: #91a0b5;
  --mvp-border: rgba(152, 169, 193, 0.28);
  --mvp-border-strong: rgba(125, 145, 173, 0.42);
  --mvp-brand: #ff6b35;
  --mvp-brand-dark: #df4e1c;
  --mvp-brand-soft: #fff0e9;
  --mvp-blue: #3b82f6;
  --mvp-blue-soft: #e9f1ff;
  --mvp-green: #18a673;
  --mvp-assigned: #12805a;
  --mvp-green-soft: #e4f8f0;
  --mvp-violet: #8067e8;
  --mvp-violet-soft: #f0edff;
  --mvp-danger: #b9404c;
  --mvp-danger-border: rgba(201, 74, 86, 0.4);
  --mvp-danger-soft: #fcecef;
  --mvp-danger-wash: rgba(201, 74, 86, 0.025);
  --mvp-shadow: 0 18px 45px rgba(41, 61, 91, 0.09);
  --mvp-shadow-small: 0 8px 22px rgba(41, 61, 91, 0.07);
  --mvp-radius: 22px;
  --mvp-radius-small: 14px;
  position: relative;
  display: block;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 107, 53, 0.08), transparent 30rem),
    radial-gradient(circle at 0% 65%, rgba(59, 130, 246, 0.07), transparent 28rem),
    var(--mvp-bg);
  color: var(--mvp-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-align: left;
  line-height: 1.45;
}

.design-mvp[data-theme="dark"] {
  --mvp-bg: #0c1424;
  --mvp-surface: rgba(21, 34, 56, 0.72);
  --mvp-surface-solid: #152238;
  --mvp-surface-muted: rgba(33, 50, 77, 0.72);
  --mvp-surface-strong: rgba(48, 68, 98, 0.8);
  --mvp-text: #f4f7fb;
  --mvp-text-soft: #aebdd1;
  --mvp-text-faint: #71839c;
  --mvp-border: rgba(175, 197, 228, 0.15);
  --mvp-border-strong: rgba(175, 197, 228, 0.28);
  --mvp-brand-soft: rgba(255, 107, 53, 0.14);
  --mvp-brand-dark: #ff9a73;
  --mvp-green: #40bf93;
  --mvp-assigned: #55d0a0;
  --mvp-danger: #f296a1;
  --mvp-danger-border: rgba(236, 115, 133, 0.42);
  --mvp-danger-soft: rgba(211, 77, 104, 0.15);
  --mvp-danger-wash: rgba(211, 77, 104, 0.055);
  --mvp-blue-soft: rgba(59, 130, 246, 0.16);
  --mvp-green-soft: rgba(24, 166, 115, 0.14);
  --mvp-violet-soft: rgba(128, 103, 232, 0.17);
  --mvp-shadow: 0 24px 55px rgba(0, 0, 0, 0.24);
  --mvp-shadow-small: 0 10px 28px rgba(0, 0, 0, 0.2);
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 107, 53, 0.14), transparent 30rem),
    radial-gradient(circle at 0% 65%, rgba(59, 130, 246, 0.12), transparent 28rem),
    var(--mvp-bg);
}

.mvp-teleport-root {
  position: static;
  min-height: 0;
  overflow: visible;
  background: transparent;
}

.mvp-dropdown-teleport-root {
  pointer-events: none;
}

.mvp-dropdown-teleport-root .filter-dropdown-menu {
  pointer-events: auto;
}

.design-mvp *,
.design-mvp *::before,
.design-mvp *::after {
  box-sizing: border-box;
}

.design-mvp button,
.design-mvp input,
.design-mvp select {
  font: inherit;
}

.design-mvp button {
  cursor: pointer;
}

.design-mvp button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.design-mvp button:focus-visible,
.design-mvp input:focus-visible,
.design-mvp select:focus-visible,
.design-mvp a:focus-visible {
  outline: 3px solid rgba(59, 130, 246, 0.45);
  outline-offset: 3px;
}

.design-mvp h1,
.design-mvp h2,
.design-mvp h3,
.design-mvp p {
  margin-top: 0;
}

.design-mvp h1,
.design-mvp h2,
.design-mvp h3,
.design-mvp strong {
  color: var(--mvp-text);
}

.design-mvp p {
  color: var(--mvp-text-soft);
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  background: var(--mvp-text);
  color: var(--mvp-bg);
  transform: translateY(-150%);
  transition: transform 0.2s ease;
}

.skip-link:focus {
  transform: translateY(0);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mvp-shell {
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.icon-button {
  display: inline-grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  padding: 0;
  border: 1px solid var(--mvp-border);
  border-radius: 12px;
  background: var(--mvp-surface);
  color: var(--mvp-text-soft);
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.icon-button:hover {
  border-color: var(--mvp-border-strong);
  color: var(--mvp-text);
  transform: translateY(-1px);
}

.icon-button--subtle {
  background: transparent;
}

.mvp-main {
  flex: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1rem 1rem 3rem;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-heading h1 {
  max-width: 32rem;
  margin-bottom: 0.5rem;
  font-size: clamp(1.9rem, 7vw, 3.45rem);
  font-weight: 800;
  letter-spacing: -0.065em;
  line-height: 1.05;
}

.page-intro {
  max-width: 34rem;
  margin-bottom: 0;
  font-size: 0.92rem;
}

.eyebrow {
  margin-bottom: 0.45rem !important;
  color: var(--mvp-brand) !important;
  font-size: 0.67rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.13em;
  line-height: 1.2;
  text-transform: uppercase;
}

.primary-action,
.secondary-action,
.filter-button,
.card-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.55rem;
  padding: 0.65rem 0.85rem;
  border-radius: 11px;
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.primary-action {
  border: 1px solid var(--mvp-brand);
  background: var(--mvp-brand);
  color: #fff;
  box-shadow: 0 8px 18px rgba(255, 107, 53, 0.2);
}

.primary-action:hover {
  background: var(--mvp-brand-dark);
  box-shadow: 0 11px 24px rgba(255, 107, 53, 0.28);
  transform: translateY(-1px);
}

.primary-action--wide {
  width: 100%;
  min-height: 3.15rem;
  font-size: 0.87rem;
}

.secondary-action,
.filter-button {
  border: 1px solid var(--mvp-border);
  background: var(--mvp-surface);
  color: var(--mvp-text-soft);
  box-shadow: var(--mvp-shadow-small);
}

.secondary-action:hover,
.filter-button:hover {
  border-color: var(--mvp-border-strong);
  color: var(--mvp-text);
  transform: translateY(-1px);
}

.refresh-controls {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.theme-toggle {
  flex: 0 0 auto;
  width: 2.55rem;
  min-height: 2.55rem;
  padding: 0;
}

.theme-toggle svg {
  font-size: 0.75rem;
}

.refresh-button-frame {
  padding: 2px;
  border-radius: 13px;
  background: var(--mvp-border);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.refresh-button-frame:hover {
  transform: translateY(-1px);
}

.refresh-button-frame.is-active {
  background: conic-gradient(
    from -90deg,
    var(--mvp-brand) calc(var(--countdown-progress) * 12deg),
    var(--mvp-border) 0
  );
}

.refresh-button-frame.is-refreshing {
  animation: refreshPulse 0.9s ease-in-out infinite;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.12);
}

.refresh-action {
  display: inline-flex;
  border: 0;
  background: var(--mvp-surface-solid);
  box-shadow: none;
}

.refresh-button-frame:hover .refresh-action {
  border-color: transparent;
  transform: none;
}

.refresh-action.is-loading svg {
  animation: spin 0.8s linear infinite;
}

.auto-update-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  min-height: 2.55rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--mvp-border);
  border-radius: 11px;
  background: var(--mvp-surface);
  color: var(--mvp-text-soft);
  cursor: pointer;
}

.auto-update-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.auto-update-check {
  display: grid;
  width: 1.1rem;
  height: 1.1rem;
  place-items: center;
  border: 1px solid var(--mvp-border-strong);
  border-radius: 5px;
  color: transparent;
  font-size: 0.6rem;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.auto-update-toggle input:checked + .auto-update-check {
  border-color: var(--mvp-green);
  background: var(--mvp-green);
  color: #fff;
}

.auto-update-toggle input:focus-visible + .auto-update-check {
  outline: 3px solid rgba(59, 130, 246, 0.35);
  outline-offset: 2px;
}

.auto-update-copy {
  display: grid;
  gap: 0.06rem;
}

.auto-update-copy strong {
  font-size: 0.62rem;
  line-height: 1.1;
}

.auto-update-copy small {
  color: var(--mvp-text-faint);
  font-size: 0.56rem;
  line-height: 1.1;
}

.search-panel {
  margin-bottom: 2rem;
  padding: 0.85rem;
  border: 1px solid var(--mvp-border);
  border-radius: var(--mvp-radius);
  background: var(--mvp-surface);
  box-shadow: var(--mvp-shadow);
  backdrop-filter: blur(18px);
}

.search-row {
  display: flex;
  gap: 0.55rem;
}

.search-input {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  min-height: 2.8rem;
  padding: 0 0.75rem;
  border: 1px solid var(--mvp-border);
  border-radius: 12px;
  background: var(--mvp-surface-muted);
  color: var(--mvp-text-faint);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus-within {
  border-color: var(--mvp-brand);
  box-shadow: 0 0 0 3px var(--mvp-brand-soft);
}

.search-input > svg {
  flex: 0 0 auto;
  margin-right: 0.55rem;
  font-size: 0.8rem;
}

.search-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--mvp-text);
  font-size: 0.78rem;
}

.design-mvp .search-input input:focus-visible {
  outline: 0;
  outline-offset: 0;
}

.search-input input::placeholder {
  color: var(--mvp-text-faint);
}

.clear-search {
  display: inline-grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--mvp-surface-strong);
  color: var(--mvp-text-soft);
  font-size: 0.65rem;
}

.filter-button {
  flex: 0 0 auto;
  min-height: 2.8rem;
  box-shadow: none;
}

.mobile-filter-fab {
  display: none;
}

.filter-count {
  display: inline-grid;
  min-width: 1.2rem;
  height: 1.2rem;
  place-items: center;
  border-radius: 50%;
  background: var(--mvp-brand);
  color: #fff;
  font-size: 0.62rem;
}

.quick-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.8rem;
  overflow: visible;
}

.quick-filter {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.85rem;
  padding: 0.36rem 0.55rem;
  border: 1px solid var(--mvp-border);
  border-radius: 999px;
  background: transparent;
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.quick-filter:hover,
.quick-filter.is-active {
  border-color: rgba(255, 107, 53, 0.3);
  background: var(--mvp-brand-soft);
  color: var(--mvp-brand);
}

.quick-filter--risk {
  color: var(--mvp-danger);
  border-color: var(--mvp-danger-border);
}

.quick-filter-total {
  display: inline-grid;
  min-width: 1.15rem;
  padding: 0.08rem 0.25rem;
  place-items: center;
  border-radius: 5px;
  background: var(--mvp-danger-soft);
  font-size: 0.6rem;
  font-weight: 750;
  line-height: 1.3;
}

.quick-filter--risk:hover,
.quick-filter--risk.is-active {
  color: var(--mvp-danger);
  border-color: var(--mvp-danger-border);
  background: var(--mvp-danger-soft);
}

.risk-filter-toggle .toggle-track.is-active { background: var(--mvp-danger); }

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--mvp-border);
}

.active-filter-label {
  color: var(--mvp-text-faint);
  font-size: 0.64rem;
  font-weight: 700;
}

.active-filter,
.clear-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.42rem;
  border: 0;
  border-radius: 7px;
  background: var(--mvp-blue-soft);
  color: var(--mvp-blue);
  font-size: 0.59rem;
  font-weight: 750;
}

.clear-filters {
  background: transparent;
  color: var(--mvp-text-soft);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.results-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.results-heading h2 {
  margin-bottom: 0.18rem;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.result-count {
  display: inline-grid;
  min-width: 1.4rem;
  height: 1.4rem;
  margin-left: 0.25rem;
  place-items: center;
  border-radius: 6px;
  background: var(--mvp-surface-strong);
  color: var(--mvp-text-soft);
  font-size: 0.68rem;
  vertical-align: 0.1rem;
}

.results-meta {
  margin-bottom: 0;
  color: var(--mvp-text-faint);
  font-size: 0.68rem;
}

.results-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
}

.view-switcher {
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.2rem;
  border: 1px solid var(--mvp-border);
  border-radius: 10px;
  background: var(--mvp-surface-muted);
}

.view-switcher-button {
  display: inline-grid;
  width: 1.8rem;
  height: 1.8rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--mvp-text-faint);
  font-size: 0.68rem;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.view-switcher-button:hover,
.view-switcher-button.is-active {
  background: var(--mvp-surface-solid);
  color: var(--mvp-brand);
  box-shadow: var(--mvp-shadow-small);
}

.sort-control {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.35rem;
  color: var(--mvp-text-faint);
  font-size: 0.63rem;
  font-weight: 700;
}

.sort-control select {
  appearance: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--mvp-text);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 750;
}

.sort-control > svg {
  margin-left: -0.2rem;
  color: var(--mvp-text-faint);
  font-size: 0.58rem;
  pointer-events: none;
}

.sort-direction-button {
  display: inline-grid;
  width: 1.55rem;
  height: 1.55rem;
  margin-left: 0.1rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--mvp-text-soft);
  font-size: 0.8rem;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.sort-direction-button:hover {
  background: var(--mvp-surface-strong);
  color: var(--mvp-brand);
  transform: translateY(-1px);
}

.game-list,
.skeleton-list {
  display: grid;
  gap: 0.75rem;
}

.game-table {
  --table-columns: 6rem minmax(0, 1.1fr) minmax(0, 0.85fr) minmax(0, 1.25fr) minmax(0, 1.25fr) 3.8rem 1.4rem;
  --table-column-gap: 0.8rem;
  overflow: hidden;
  border: 1px solid var(--mvp-border);
  border-radius: var(--mvp-radius-small);
  background: var(--mvp-surface);
  box-shadow: var(--mvp-shadow-small);
}

.game-table--with-distance {
  --table-columns: 6rem minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1.2fr) minmax(0, 1.2fr) 3.8rem 4.6rem 1.4rem;
}

.game-table-header,
.game-table-main,
.game-table-secondary {
  display: grid;
  grid-template-columns: var(--table-columns);
  align-items: start;
  column-gap: var(--table-column-gap);
}

.game-table-header {
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--mvp-border);
  background: var(--mvp-surface-muted);
  color: var(--mvp-text-soft);
  font-size: 0.65rem;
  font-weight: 600;
}

.table-header-cell { min-width: 0; }

.table-header-label,
.table-sort-button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.3rem;
  color: inherit;
  font: inherit;
  line-height: 1.3;
  text-align: left;
}

.table-sort-button {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease;
}

.table-sort-button:hover,
.table-sort-button:focus-visible,
.table-sort-button.is-active { color: var(--mvp-brand-dark); }

.table-sort-button:focus-visible {
  outline: 2px solid var(--mvp-brand);
  outline-offset: 4px;
  border-radius: 4px;
}

.table-header-icon {
  flex: 0 0 auto;
  font-size: 0.6rem;
  opacity: 0.65;
}

.table-sort-icon {
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 0.54rem;
  opacity: 0.65;
}

.game-table-row {
  min-width: 0;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--mvp-border);
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.game-table-row:last-child { border-bottom: 0; }
.game-table-row:hover { background: var(--mvp-surface-muted); }

.game-table-row--at-risk {
  background: var(--mvp-danger-wash);
  box-shadow: inset 0 0 0 1px var(--mvp-danger-border);
}

.game-table-row--at-risk:hover { background: var(--mvp-danger-soft); }

.game-table-row:focus-visible {
  outline: 0;
  box-shadow: inset 0 0 0 2px var(--mvp-brand);
}

.table-cell { min-width: 0; }
.table-cell-label { display: none; }

.table-cell--date {
  display: grid;
  gap: 0.16rem;
}

.table-cell--date strong {
  color: var(--mvp-text);
  font-size: 0.72rem;
  font-weight: 650;
}

.table-cell--date time {
  color: var(--mvp-text-soft);
  font-size: 0.7rem;
}

.table-cell--home strong,
.table-cell--away strong,
.table-cell--league strong,
.table-cell--venue > span {
  display: block;
  color: var(--mvp-text);
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.table-cell--league strong,
.table-cell--venue > span {
  color: var(--mvp-text-soft);
  font-size: 0.7rem;
  font-weight: 500;
}

.table-cell--venue > small {
  display: block;
  margin-top: 0.16rem;
  color: var(--mvp-text-faint);
  font-size: 0.62rem;
}

.table-cell--license .game-tag { display: inline-block; }

.game-table-secondary { margin-top: 0.3rem; }

.table-cell--assignment {
  grid-column: 1 / -1;
  display: grid;
  gap: 0.35rem;
}

.table-distance {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--mvp-text-soft);
  font-size: 0.65rem;
  white-space: nowrap;
}

.table-distance svg { color: var(--mvp-text-faint); }
.table-distance--unknown { color: var(--mvp-text-faint); }
.table-cell--action { justify-self: end; }

.table-cell--action > span {
  display: inline-flex;
  align-items: center;
  color: var(--mvp-brand);
  font-size: 0.85rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.2rem 0;
}

.pagination-summary {
  margin-bottom: 0;
  color: var(--mvp-text-faint);
  font-size: 0.62rem;
  white-space: nowrap;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-button {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0 0.55rem;
  border: 1px solid var(--mvp-border);
  border-radius: 8px;
  background: var(--mvp-surface);
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
  font-weight: 750;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.pagination-button:hover:not(:disabled),
.pagination-button.is-active {
  border-color: var(--mvp-brand);
  background: var(--mvp-brand-soft);
  color: var(--mvp-brand);
}

.pagination-button.is-active {
  font-weight: 850;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.pagination-button--page {
  width: 2rem;
  padding: 0;
}

.pagination-button--arrow {
  color: var(--mvp-text);
}

.pagination-ellipsis {
  display: inline-grid;
  width: 1.25rem;
  min-height: 2rem;
  place-items: center;
  color: var(--mvp-text-faint);
  font-size: 0.72rem;
}

.game-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid var(--mvp-border);
  border-radius: 18px;
  background: var(--mvp-surface);
  box-shadow: 0 4px 18px rgba(41, 61, 91, 0.035);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.game-card:hover {
  border-color: var(--mvp-border-strong);
  box-shadow: var(--mvp-shadow-small);
}

.game-card--at-risk {
  border-color: var(--mvp-danger-border);
  background: linear-gradient(var(--mvp-danger-wash), var(--mvp-danger-wash)), var(--mvp-surface);
}

.game-card--at-risk:hover { border-color: var(--mvp-danger); }

.game-card:focus-visible {
  outline: 2px solid var(--mvp-brand);
  outline-offset: 3px;
}

.game-card-header,
.game-card-footer,
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.game-card-header {
  align-items: baseline;
  margin-bottom: 0.85rem;
}

.match-label {
  min-width: 0;
  margin: 0 !important;
  color: var(--mvp-brand-dark) !important;
  font-size: 0.7rem !important;
  font-weight: 650 !important;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.match-time {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.3rem;
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
}

.game-card-body {
  display: grid;
  grid-template-columns: 3.6rem minmax(0, 1fr);
  align-items: start;
  gap: 0.85rem 0.75rem;
}

.game-date {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.15rem;
  min-height: 5rem;
  padding: 0.5rem 0.2rem;
  border-radius: 12px;
  background: var(--mvp-brand-soft);
  color: var(--mvp-brand-dark);
}

.game-date--blue { background: var(--mvp-blue-soft); color: var(--mvp-blue); }
.game-date--green { background: var(--mvp-green-soft); color: var(--mvp-green); }
.game-date--violet { background: var(--mvp-violet-soft); color: var(--mvp-violet); }

.game-date > span {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.game-date strong {
  color: currentColor;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1;
}

.game-date-time {
  margin-top: 0.2rem;
  color: currentColor;
  font-size: 0.6rem;
  font-weight: 650;
  white-space: nowrap;
}

.game-information { min-width: 0; }

.game-information h3.match-teams {
  display: grid;
  gap: 0.4rem;
  margin: 0 0 0.65rem;
  color: var(--mvp-text);
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.match-team {
  display: grid;
  grid-template-columns: 1.8rem minmax(0, 1fr);
  align-items: baseline;
  gap: 0.35rem;
}

.match-team small {
  color: var(--mvp-text-faint);
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0;
}

.match-team > span { overflow-wrap: anywhere; }

.game-detail-sheet h2 span {
  color: var(--mvp-text-faint);
  font-size: 0.68em;
  font-weight: 600;
}

.venue-line {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin: 0;
  color: var(--mvp-text-soft) !important;
  font-size: 0.7rem !important;
  line-height: 1.45;
}

.venue-line span { min-width: 0; overflow-wrap: anywhere; }
.venue-line svg { flex: 0 0 auto; color: var(--mvp-text-faint); }

.card-referees {
  grid-column: 1 / -1;
  min-width: 0;
}

.game-card-footer {
  margin-top: auto;
  padding-top: 0.65rem;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.game-tag {
  padding: 0.26rem 0.4rem;
  border-radius: 6px;
  background: var(--mvp-surface-strong);
  color: var(--mvp-text-soft);
  font-size: 0.56rem;
  font-weight: 750;
  white-space: nowrap;
}

.game-tag--license {
  background: var(--mvp-blue-soft);
  color: var(--mvp-blue);
}

.card-action {
  min-height: 2rem;
  padding: 0.45rem 0.2rem 0.45rem 0.65rem;
  border: 0;
  background: transparent;
  color: var(--mvp-brand);
  white-space: nowrap;
}

.card-action:hover {
  color: var(--mvp-brand-dark);
  transform: translateX(2px);
}

.state-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--mvp-border);
  border-radius: var(--mvp-radius-small);
  background: var(--mvp-surface);
  box-shadow: var(--mvp-shadow-small);
}

.state-card--error {
  border-color: rgba(220, 53, 69, 0.25);
}

.state-icon {
  display: inline-grid;
  flex: 0 0 2.7rem;
  width: 2.7rem;
  height: 2.7rem;
  place-items: center;
  border-radius: 12px;
  background: var(--mvp-brand-soft);
  color: var(--mvp-brand);
}

.state-card--error .state-icon {
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
}

.state-content {
  flex: 1;
  min-width: 0;
}

.state-content .eyebrow {
  margin-bottom: 0.25rem !important;
}

.state-content h3 {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
  letter-spacing: -0.025em;
}

.state-content p:last-child {
  margin-bottom: 0;
  font-size: 0.72rem;
}

.preview-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.8rem;
  padding: 1rem;
  border: 1px dashed var(--mvp-border-strong);
  border-radius: var(--mvp-radius-small);
  background: color-mix(in srgb, var(--mvp-surface) 70%, transparent);
}

.preview-controls .eyebrow {
  margin-bottom: 0.2rem !important;
}

.preview-controls strong,
.preview-controls span {
  display: block;
}

.preview-controls strong {
  font-size: 0.76rem;
}

.preview-controls > div:first-child > span {
  margin-top: 0.15rem;
  color: var(--mvp-text-faint);
  font-size: 0.62rem;
}

.state-switcher {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 10px;
  background: var(--mvp-surface-strong);
}

.state-switcher-button {
  min-height: 1.85rem;
  padding: 0.35rem 0.55rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--mvp-text-soft);
  font-size: 0.6rem;
  font-weight: 750;
}

.state-switcher-button.is-active {
  background: var(--mvp-surface-solid);
  color: var(--mvp-text);
  box-shadow: var(--mvp-shadow-small);
}

.skeleton-card {
  min-height: 12.7rem;
}

.skeleton-card-body {
  display: flex;
  gap: 0.8rem;
  margin: 1rem 0;
}

.skeleton-date {
  flex: 0 0 3.7rem;
  height: 4.65rem;
  border-radius: 13px;
  background: var(--mvp-surface-strong);
  animation: pulse 1.3s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  padding-top: 0.25rem;
}

.skeleton-line {
  width: 80%;
  height: 0.75rem;
  margin-bottom: 0.55rem;
  border-radius: 999px;
  background: var(--mvp-surface-strong);
  animation: pulse 1.3s ease-in-out infinite;
}

.skeleton-line--short {
  width: 4rem;
  height: 0.6rem;
}

.skeleton-line--small {
  width: 35%;
  height: 0.55rem;
}

.skeleton-line--medium {
  width: 55%;
  height: 0.6rem;
}

.skeleton-line--button {
  width: 5rem;
  height: 1.9rem;
  margin: 0 0 0 auto;
}

.mvp-footer {
  border-top: 1px solid var(--mvp-border);
  background: color-mix(in srgb, var(--mvp-surface) 78%, transparent);
}

.mvp-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem 1.5rem;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1rem;
}

.mvp-footer-brand {
  display: grid;
  gap: 0.12rem;
}

.mvp-footer-brand strong {
  font-size: 0.72rem;
}

.mvp-footer-brand span,
.mvp-footer-copyright {
  color: var(--mvp-text-faint);
  font-size: 0.6rem;
}

.mvp-footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
}

.mvp-footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s ease;
}

.mvp-footer-link:hover {
  color: var(--mvp-brand);
}

.mvp-footer-github {
  position: relative;
}

.mvp-footer-github-trigger {
  cursor: pointer;
  font: inherit;
}

.mvp-footer-github-chevron {
  font-size: 0.52rem;
  transition: transform 0.2s ease;
}

.mvp-footer-github.is-open .mvp-footer-github-chevron {
  transform: rotate(180deg);
}

.mvp-footer-github-tooltip {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.7rem);
  z-index: 5;
  display: grid;
  min-width: 10rem;
  gap: 0.15rem;
  padding: 0.65rem;
  border: 1px solid var(--mvp-border);
  border-radius: 0.7rem;
  background: var(--mvp-surface-solid);
  box-shadow: 0 12px 30px rgba(11, 22, 39, 0.16);
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.25rem);
  transition: opacity 0.18s ease, transform 0.18s ease;
  visibility: hidden;
}

.mvp-footer-github-tooltip::after {
  position: absolute;
  right: 1.2rem;
  bottom: -0.35rem;
  width: 0.65rem;
  height: 0.65rem;
  border-right: 1px solid var(--mvp-border);
  border-bottom: 1px solid var(--mvp-border);
  background: var(--mvp-surface-solid);
  content: '';
  transform: rotate(45deg);
}

.mvp-footer-github:hover .mvp-footer-github-tooltip,
.mvp-footer-github-tooltip.is-open {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
  visibility: visible;
}

.mvp-footer-github-title {
  padding: 0.1rem 0.35rem 0.35rem;
  color: var(--mvp-text-faint);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.mvp-footer-github-tooltip a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.42rem 0.35rem;
  border-radius: 0.4rem;
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
  font-weight: 700;
  text-decoration: none;
}

.mvp-footer-github-tooltip a:hover,
.mvp-footer-github-tooltip a:focus-visible {
  background: var(--mvp-brand-soft);
  color: var(--mvp-brand);
}

.mvp-footer-github-tooltip a svg {
  font-size: 0.55rem;
}

.modal-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(10, 20, 36, 0.48);
  backdrop-filter: blur(5px);
}

.filter-sheet,
.radius-sheet,
.game-detail-sheet {
  position: relative;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  border: 1px solid var(--mvp-border);
  border-radius: 24px;
  background: var(--mvp-surface-solid);
  box-shadow: 0 -20px 70px rgba(11, 22, 39, 0.24);
  color: var(--mvp-text);
}

.legal-sheet {
  position: relative;
  width: 100%;
  max-width: 34rem;
  padding: 1.2rem 1rem 1rem;
  border: 1px solid var(--mvp-border);
  border-radius: 24px;
  background: var(--mvp-surface-solid);
  box-shadow: 0 20px 70px rgba(11, 22, 39, 0.24);
  color: var(--mvp-text);
}

.legal-content {
  display: grid;
  gap: 0.9rem;
  color: var(--mvp-text-soft);
  font-size: 0.75rem;
}

.legal-content p {
  margin-bottom: 0;
}

.legal-content strong {
  font-size: 0.68rem;
}

.legal-content a {
  color: var(--mvp-brand);
  font-weight: 700;
}

.legal-note {
  padding: 0.75rem;
  border-radius: 11px;
  background: var(--mvp-brand-soft);
  color: var(--mvp-text-soft);
  font-size: 0.66rem;
}

.support-sheet {
  position: relative;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  border: 1px solid var(--mvp-border);
  border-radius: 24px;
  background: var(--mvp-surface-solid);
  box-shadow: 0 20px 70px rgba(11, 22, 39, 0.24);
  color: var(--mvp-text);
}

.support-accent {
  height: 0.35rem;
  background: var(--mvp-brand);
}

.support-sheet-content {
  padding: 1.2rem 1rem 0;
}

.support-intro {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem;
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 14px;
  background: var(--mvp-brand-soft);
}

.support-intro-icon {
  display: inline-grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 10px;
  background: var(--mvp-brand);
  color: #fff;
}

.support-intro h3 {
  margin-bottom: 0.28rem;
  font-size: 0.88rem;
  letter-spacing: -0.025em;
}

.support-intro p {
  margin-bottom: 0;
  font-size: 0.68rem;
}

.support-points {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.support-point {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.62rem 0.7rem;
  border: 1px solid var(--mvp-border);
  border-radius: 11px;
  background: var(--mvp-surface-muted);
}

.support-point-icon {
  display: inline-grid;
  flex: 0 0 auto;
  width: 1.8rem;
  height: 1.8rem;
  place-items: center;
  border-radius: 9px;
  background: var(--mvp-blue-soft);
  color: var(--mvp-blue);
  font-size: 0.7rem;
}

.support-point > span:last-child {
  display: grid;
  gap: 0.08rem;
}

.support-point strong {
  font-size: 0.68rem;
}

.support-point small {
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
}

.support-paypal-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin: 1.15rem 0 0.2rem;
  color: var(--mvp-text-faint);
  font-size: 0.61rem;
  text-align: center;
}

.support-paypal-note svg {
  color: var(--mvp-blue);
}

.support-actions {
  padding: 0 1rem 1rem;
}

.filter-sheet {
  padding: 1.2rem 1rem 1rem;
}

.radius-sheet {
  padding: 1.2rem 1rem 1rem;
}

.sheet-handle {
  width: 2.5rem;
  height: 0.25rem;
  margin: -0.35rem auto 1.2rem;
  border-radius: 999px;
  background: var(--mvp-surface-strong);
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.sheet-header h2 {
  margin-bottom: 0;
  font-size: 1.35rem;
  letter-spacing: -0.05em;
}

.filter-fields {
  display: grid;
  gap: 0.75rem;
}

.filter-field {
  position: relative;
  display: grid;
  gap: 0.35rem;
}

.filter-field > span {
  color: var(--mvp-text-soft);
  font-size: 0.66rem;
  font-weight: 800;
}

.filter-dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  width: 100%;
  min-height: 2.8rem;
  padding: 0 0.75rem;
  border: 1px solid var(--mvp-border);
  border-radius: 11px;
  background: var(--mvp-surface-muted);
  color: var(--mvp-text);
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.filter-dropdown-trigger:hover,
.filter-dropdown-trigger[aria-expanded="true"] {
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.filter-dropdown-trigger > svg {
  flex: 0 0 auto;
  color: var(--mvp-text-faint);
  font-size: 0.6rem;
  transition: transform 0.2s ease;
}

.filter-dropdown-trigger[aria-expanded="true"] > svg {
  transform: rotate(180deg);
}

.filter-dropdown-value {
  overflow: hidden;
  color: var(--mvp-text);
  font-size: 0.72rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-dropdown-value.is-placeholder {
  color: var(--mvp-text-soft);
}

.filter-dropdown-menu {
  position: fixed;
  z-index: 70;
  top: 0;
  left: 0;
  max-height: var(--filter-dropdown-max-height, 22rem);
  overflow: hidden;
  padding: 0.55rem;
  border: 1px solid var(--mvp-border);
  border-radius: 13px;
  background: var(--mvp-surface-solid);
  box-shadow: var(--mvp-shadow);
  animation: filterDropdownIn 0.16s ease-out;
}

.filter-dropdown-search {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.4rem;
  padding: 0 0.65rem;
  border: 1px solid var(--mvp-border);
  border-radius: 9px;
  background: var(--mvp-surface-muted);
  color: var(--mvp-text-faint);
}

.filter-dropdown-search:focus-within {
  border-color: var(--mvp-brand);
  box-shadow: 0 0 0 3px var(--mvp-brand-soft);
}

.filter-dropdown-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--mvp-text);
  font-size: 0.7rem;
}

.design-mvp .filter-dropdown-search input:focus-visible {
  outline: 0;
  outline-offset: 0;
}

.filter-dropdown-search input::placeholder {
  color: var(--mvp-text-faint);
}

.filter-dropdown-search > svg {
  flex: 0 0 auto;
  font-size: 0.68rem;
}

.filter-dropdown-search button {
  display: grid;
  flex: 0 0 auto;
  width: 1.3rem;
  height: 1.3rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--mvp-surface-strong);
  color: var(--mvp-text-soft);
  font-size: 0.58rem;
}

.filter-dropdown-options {
  display: grid;
  gap: 0.2rem;
  max-height: min(13rem, calc(var(--filter-dropdown-max-height, 22rem) - 4.2rem));
  margin-top: 0.45rem;
  overflow-y: auto;
}

.filter-dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 2.25rem;
  padding: 0.5rem 0.55rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--mvp-text-soft);
  font-size: 0.68rem;
  text-align: left;
}

.filter-dropdown-option:hover,
.filter-dropdown-option.is-selected {
  background: var(--mvp-brand-soft);
  color: var(--mvp-brand);
}

.filter-dropdown-option span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-dropdown-option svg {
  flex: 0 0 auto;
  font-size: 0.62rem;
}

.filter-dropdown-empty,
.filter-dropdown-summary {
  margin: 0.5rem 0.55rem 0.1rem;
  color: var(--mvp-text-faint);
  font-size: 0.62rem;
}

.filter-dropdown-summary {
  color: var(--mvp-brand);
  font-weight: 750;
}

.filter-date-picker {
  display: grid;
  gap: 0.35rem;
  padding: 0.55rem 0 0.1rem;
}

.date-picker-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.2rem 0 0.35rem;
}

.date-picker-heading > div {
  display: grid;
  gap: 0.2rem;
}

.date-picker-heading span {
  color: var(--mvp-text-soft);
  font-size: 0.66rem;
  font-weight: 800;
}

.date-picker-heading strong {
  color: var(--mvp-text);
  font-size: 0.74rem;
  font-weight: 750;
}

.date-picker-heading > svg {
  color: var(--mvp-brand);
  font-size: 0.8rem;
}

.date-picker-calendar {
  padding: 0.7rem;
  border: 1px solid var(--mvp-border);
  border-radius: 11px;
  background: var(--mvp-surface-muted);
}

.date-picker-toolbar {
  display: grid;
  grid-template-columns: 2rem 1fr 2rem;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.7rem;
  text-align: center;
}

.date-picker-toolbar strong {
  color: var(--mvp-text);
  font-size: 0.72rem;
  text-transform: capitalize;
}

.date-picker-nav {
  display: inline-grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--mvp-text-soft);
  font-size: 0.62rem;
}

.date-picker-nav:hover:not(:disabled) {
  background: var(--mvp-surface-strong);
  color: var(--mvp-brand);
}

.date-picker-nav:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.date-picker-weekdays,
.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.25rem;
}

.date-picker-weekdays {
  margin-bottom: 0.25rem;
}

.date-picker-weekdays span {
  color: var(--mvp-text-faint);
  font-size: 0.58rem;
  font-weight: 800;
  text-align: center;
}

.date-picker-day {
  display: grid;
  min-height: 2rem;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--mvp-text);
  font-size: 0.68rem;
  font-weight: 650;
}

.date-picker-day:hover:not(:disabled),
.date-picker-day.is-today {
  border-color: var(--mvp-brand);
  color: var(--mvp-brand);
}

.date-picker-day.is-outside {
  color: var(--mvp-text-faint);
}

.date-picker-day.is-selected {
  border-color: var(--mvp-brand);
  background: var(--mvp-brand);
  color: #fff;
}

.date-picker-day:disabled {
  cursor: not-allowed;
  color: var(--mvp-text-faint);
  opacity: 0.4;
}

.nearby-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.8rem 0;
  border: 0;
  background: transparent;
  color: var(--mvp-text);
  cursor: pointer;
  text-align: left;
}

.nearby-toggle:hover .nearby-toggle-copy strong {
  color: var(--mvp-brand);
}

.nearby-toggle-copy {
  display: grid;
  gap: 0.25rem;
}

.nearby-toggle-copy strong {
  font-size: 0.75rem;
}

.nearby-toggle-copy small {
  color: var(--mvp-text-faint);
  font-size: 0.64rem;
}

.toggle-track {
  display: flex;
  flex: 0 0 2.7rem;
  align-items: center;
  width: 2.7rem;
  height: 1.55rem;
  padding: 0.18rem;
  border-radius: 999px;
  background: var(--mvp-surface-strong);
  transition: background 0.2s ease;
}

.toggle-track > span {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--mvp-surface-solid);
  box-shadow: var(--mvp-shadow-small);
  transition: transform 0.2s ease;
}

.toggle-track.is-active {
  background: var(--mvp-brand);
}

.toggle-track.is-active > span {
  transform: translateX(1.15rem);
}

.radius-intro {
  margin-bottom: 1rem;
  font-size: 0.75rem;
}

.radius-value {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.radius-value strong {
  color: var(--mvp-brand);
  font-size: 1.8rem;
  letter-spacing: -0.06em;
}

.radius-value span {
  color: var(--mvp-text-faint);
  font-size: 0.62rem;
  text-align: right;
}

.radius-slider {
  display: grid;
  gap: 0.55rem;
}

.radius-slider input {
  appearance: none;
  width: 100%;
  height: 0.42rem;
  margin: 0.35rem 0;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--mvp-brand) 0%,
    var(--mvp-brand) var(--radius-progress),
    var(--mvp-surface-strong) var(--radius-progress),
    var(--mvp-surface-strong) 100%
  );
  cursor: pointer;
}

.radius-slider input::-webkit-slider-thumb {
  appearance: none;
  width: 1.15rem;
  height: 1.15rem;
  border: 3px solid var(--mvp-surface-solid);
  border-radius: 50%;
  background: var(--mvp-brand);
  box-shadow: 0 3px 10px rgba(255, 107, 53, 0.35);
}

.radius-slider input::-moz-range-thumb {
  width: 1.15rem;
  height: 1.15rem;
  border: 3px solid var(--mvp-surface-solid);
  border-radius: 50%;
  background: var(--mvp-brand);
  box-shadow: 0 3px 10px rgba(255, 107, 53, 0.35);
}

.radius-slider-scale {
  display: flex;
  justify-content: space-between;
  color: var(--mvp-text-faint);
  font-size: 0.6rem;
}

.radius-error {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin: 0.9rem 0 0;
  padding: 0.7rem;
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 11px;
  background: rgba(220, 53, 69, 0.08);
  color: #dc3545 !important;
  font-size: 0.68rem !important;
}

.radius-error svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}

.radius-disable {
  margin-top: 0.9rem;
}

.is-spinning {
  animation: spin 0.8s linear infinite;
}

.sheet-actions {
  display: flex;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.sheet-actions > * {
  flex: 1;
}

.game-detail-sheet {
  overflow: hidden;
}

.detail-close {
  position: absolute;
  z-index: 2;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.75);
}

.design-mvp[data-theme="dark"] .detail-close {
  background: rgba(21, 34, 56, 0.85);
}

.detail-accent {
  height: 0.35rem;
  background: var(--mvp-brand);
}

.detail-accent--blue {
  background: var(--mvp-blue);
}

.detail-accent--green {
  background: var(--mvp-green);
}

.detail-accent--violet {
  background: var(--mvp-violet);
}

.detail-content {
  padding: 3.6rem 1rem 1rem;
}

.detail-header {
  margin-bottom: 1.1rem;
}

.detail-header--compact {
  flex-wrap: wrap;
  justify-content: space-between;
}

.detail-date {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.9rem;
  max-width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid color-mix(in srgb, var(--mvp-brand) 25%, transparent);
  border-radius: 12px;
  background: var(--mvp-brand-soft);
  color: var(--mvp-text);
  font-size: 0.9rem;
  font-weight: 750;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
}

.detail-date-day,
.detail-date-time {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.detail-date-time {
  color: var(--mvp-brand-dark);
  font-size: 1.05rem;
  font-weight: 800;
}

.detail-date svg {
  flex: 0 0 auto;
  color: var(--mvp-brand-dark);
  font-size: 0.8rem;
}

.detail-content h2 {
  max-width: 28rem;
  margin-bottom: 0.5rem;
  font-size: clamp(1.55rem, 7vw, 2.3rem);
  font-weight: 850;
  letter-spacing: -0.07em;
  line-height: 1.08;
}

.detail-location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  font-size: 0.75rem;
}

.detail-location-copy {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.4rem;
  color: var(--mvp-text-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-location-copy svg {
  flex: 0 0 auto;
  color: var(--mvp-brand);
}

.detail-map-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.3rem;
  color: var(--mvp-brand);
  font-size: 0.64rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.detail-map-link:hover {
  color: var(--mvp-brand-dark);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  padding: 0.8rem 0;
  border-top: 1px solid var(--mvp-border);
  border-bottom: 1px solid var(--mvp-border);
}

.detail-info-grid > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-info-icon {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 1.8rem;
  place-items: center;
  border-radius: 8px;
  background: var(--mvp-surface-muted);
  color: var(--mvp-brand);
  font-size: 0.65rem;
}

.detail-info-grid > div > span:last-child {
  display: grid;
  gap: 0.1rem;
}

.detail-info-grid small {
  color: var(--mvp-text-faint);
  font-size: 0.58rem;
}

.detail-info-grid strong {
  font-size: 0.68rem;
}

.detail-license-chip {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 0.2rem 0.38rem;
  border-radius: 6px;
  background: var(--mvp-blue-soft);
  color: var(--mvp-blue);
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
}

.detail-referees { margin-top: 0.8rem; }

.game-detail-sheet--at-risk { border-color: var(--mvp-danger-border); }
.game-detail-sheet--at-risk .detail-accent { background: var(--mvp-danger); }

.detail-note {
  display: flex;
  gap: 0.55rem;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 11px;
  background: var(--mvp-blue-soft);
  color: var(--mvp-blue);
}

.detail-note svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}

.detail-note p {
  margin-bottom: 0;
  color: var(--mvp-text-soft);
  font-size: 0.66rem;
}

.detail-footer {
  padding: 0.9rem 1rem 1rem;
  border-top: 1px solid var(--mvp-border);
  background: color-mix(in srgb, var(--mvp-surface-muted) 55%, transparent);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes filterDropdownIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes refreshPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
}

@media (min-width: 560px) {
  .mvp-main {
    padding-right: 1.5rem;
    padding-left: 1.5rem;
  }

  .refresh-action {
    display: inline-flex;
  }

  .modal-backdrop {
    align-items: center;
    padding: 1rem;
  }

  .filter-sheet,
  .radius-sheet,
  .game-detail-sheet,
  .support-sheet {
    max-width: 34rem;
    border-radius: 24px;
  }
}

@media (max-width: 899.98px) {
  .mobile-filter-fab {
    position: fixed;
    z-index: 40;
    right: 1rem;
    bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 2.75rem;
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    background: var(--mvp-brand);
    box-shadow: 0 12px 28px rgba(255, 107, 53, 0.3);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 800;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .mobile-filter-fab:hover {
    box-shadow: 0 15px 32px rgba(255, 107, 53, 0.38);
    transform: translateY(-2px);
  }

  .mobile-filter-fab-count {
    display: inline-grid;
    min-width: 1.2rem;
    height: 1.2rem;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    font-size: 0.58rem;
  }

  .pagination {
    align-items: stretch;
    flex-direction: column;
    gap: 0.6rem;
  }

  .pagination-actions {
    justify-content: space-between;
  }

  .pagination-button-label {
    display: none;
  }

  .pagination-button--arrow {
    width: 2rem;
    padding: 0;
  }

}

@media (max-width: 559.98px) {
  .page-heading {
    flex-direction: column;
  }

  .refresh-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .results-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.65rem;
  }

  .results-tools {
    width: 100%;
  }

  .sort-control {
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
  }

  .sort-control select {
    flex: 1;
    min-width: 0;
  }

  .mvp-footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .mvp-footer-github-tooltip {
    right: auto;
    left: 0;
  }

  .mvp-footer-github-tooltip::after {
    right: auto;
    left: 1.2rem;
  }
}

@media (min-width: 768px) {
  .mvp-main {
    padding: 1.5rem 2rem 4rem;
  }

  .page-heading {
    margin-bottom: 2rem;
  }

  .search-panel {
    padding: 1rem;
  }

  .game-card {
    padding: 1.1rem;
  }

  .game-card-body {
    gap: 1rem;
  }

  .game-date {
    min-height: 5.1rem;
  }

  .game-information h3.match-teams {
    font-size: 1rem;
  }

}

@media (min-width: 1024px) {
  .mvp-main {
    padding: 2rem 2.5rem 4rem;
  }

  .game-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .state-card {
    padding: 1.2rem;
  }
}

@media (min-width: 1280px) {
  .mvp-main {
    padding-right: 4rem;
    padding-left: 4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .design-mvp *,
  .design-mvp *::before,
  .design-mvp *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
