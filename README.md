# Spielebasar Frontend

Ein modernes Vue.js Frontend für das Spielebasar System, entwickelt mit Vite und Vue 3.

## 👨‍💻 Autor

**Dirk Drutschmann**  
📧 [mail@drutschmann.dev](mailto:mail@drutschmann.dev)

## 📄 Lizenz

Dieses Projekt steht unter der **Creative Commons Attribution-NonCommercial 4.0 International License** (CC BY-NC 4.0).

### Was ist erlaubt:
- ✅ **Teilen**: Das Material in jedem Medium oder Format verbreiten
- ✅ **Anpassen**: Das Material remixen, verändern und darauf aufbauen
- ✅ **Open Source**: Das Projekt ist Open Source und kann geforkt werden

### Was ist nicht erlaubt:
- ❌ **Kommerzielle Nutzung**: Das Material darf nicht für kommerzielle Zwecke verwendet werden

### Attribution:
Bei der Nutzung oder Weiterverbreitung muss der Autor genannt werden:
```
Autor: Dirk Drutschmann (mail@drutschmann.dev)
Lizenz: CC BY-NC 4.0
```

## 🤝 Beitragen

**Feel free to pull request!** 

Wir freuen uns über Beiträge zur Verbesserung des Projekts:

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Erstellen Sie einen Pull Request

## 🚀 Features

- **Moderne Technologie**: Vue 3 mit Composition API und Vite
- **Responsive Design**: Bootstrap 5 mit custom Styling
- **Wiederverwendbare Komponenten**: Modulare UI-Komponenten
- **Performance Optimiert**: Schnelle Build-Zeiten mit Vite
- **Environment Configuration**: Zentrale Konfiguration über Umgebungsvariablen
- **Tabellen-Funktionalität**: Tabulator Tables für erweiterte Tabellen-Features
- **Excel Export**: Vue JSON Excel für Datenexport
- **Multiselect**: Vue Multiselect für erweiterte Auswahl-Felder
- **Font Awesome Icons**: Umfangreiche Icon-Bibliothek

## 🛠️ Technologie-Stack

- **Vue 3.5.18**: Neueste Vue Version mit Composition API
- **Vite 7.0.6**: Schneller Build-Tool und Dev-Server
- **Bootstrap 5.3.7**: CSS Framework
- **Font Awesome 7.0.0**: Icon Library
- **Vue Router 4.5.1**: Client-side Routing
- **Vuex 4.1.0**: State Management
- **Tabulator Tables 6.3.1**: Erweiterte Tabellen-Funktionalität
- **Axios 1.11.0**: HTTP Client
- **Date-fns 4.1.0**: Datums-Utilities
- **Vue Multiselect 3.3.1**: Multiselect Komponenten

## 📁 Projekt-Struktur

```
src/
├── components/
│   ├── layout/             # Layout-Komponenten
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   ├── AnswerList.vue      # Antwort-Listen
│   ├── BasarList.vue       # Basar-Listen
│   ├── GamesList.vue       # Spiele-Listen
│   ├── HistoryList.vue     # Historie-Listen
│   ├── LinkList.vue        # Link-Listen
│   ├── LinkViewList.vue    # Link-View-Listen
│   └── SRList.vue          # Schiedsrichter-Listen
├── config/
│   ├── datatable.config.js # Datatable-Konfiguration
│   └── env.js              # Umgebungsvariablen-Konfiguration
├── directives/
│   └── debounce.js         # Debounce-Direktive
├── models/
│   └── user.js             # User-Model
├── plugins/
│   ├── bootstrap.js        # Bootstrap-Plugin
│   ├── index.js            # Plugin-Index
│   └── jquery.js           # jQuery-Plugin
├── services/
│   ├── api-client.js       # API-Client
│   ├── auth.service.js     # Authentifizierung
│   ├── games.service.js    # Spiele-Service
│   ├── ical.service.js     # iCal-Service
│   ├── link.service.js     # Link-Service
│   └── user.service.js     # User-Service
├── stores/
│   ├── auth.store.js       # Auth-Store
│   └── games.store.js      # Games-Store
├── styles/
│   ├── app.css             # App-spezifische Styles
│   └── globals.css         # Globale Styles
├── utils/
│   └── fieldUtils.js       # Feld-Utilities
├── views/
│   ├── AllView.vue         # Alle-Ansicht
│   ├── AnswerView.vue      # Antwort-Ansicht
│   ├── BasarView.vue       # Basar-Ansicht
│   ├── ExternalView.vue    # Externe-Ansicht
│   ├── GamesView.vue       # Spiele-Ansicht
│   ├── HistoryView.vue     # Historie-Ansicht
│   ├── LinkView.vue        # Link-Ansicht
│   ├── LoginView.vue       # Login-Ansicht
│   ├── ProfileView.vue     # Profil-Ansicht
│   ├── ResetPasswordView.vue # Passwort-Reset-Ansicht
│   ├── ResetView.vue       # Reset-Ansicht
│   └── UserView.vue        # User-Ansicht
├── assets/                 # Statische Assets
│   ├── email.svg
│   ├── WhatsAppButtonGreenMedium.svg
│   ├── whistle-icon.svg
│   └── whistle.svg
├── router/
│   └── index.js            # Router-Konfiguration
└── main.js                 # App-Einstiegspunkt
```

## 🌍 Umgebungsvariablen

Das Projekt verwendet Umgebungsvariablen für die Konfiguration.

### Schnellstart

```bash
# .env Datei erstellen
cp env.example .env

# Werte anpassen
# Development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_DEBUG_MODE=true

# Production
VITE_API_BASE_URL=https://api.srbasar.de/api
VITE_ENABLE_DEBUG_MODE=false
```

## 🎨 Design-System

### Farben

- **Primary**: #0d6efd (Bootstrap Blau)
- **Secondary**: #6c757d (Grau)
- **Success**: #198754 (Grün)
- **Danger**: #dc3545 (Rot)
- **Warning**: #ffc107 (Gelb)
- **Info**: #0dcaf0 (Cyan)

### Komponenten

Alle UI-Komponenten sind:

- **Wiederverwendbar**: Konsistente Props und Events
- **Responsive**: Mobile-first Design
- **Accessible**: ARIA-Labels und Keyboard-Navigation
- **Stylable**: CSS-Variablen für einfache Anpassungen

## 🚀 Installation & Entwicklung

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Installation

```bash
npm install
```

### Umgebungsvariablen konfigurieren

```bash
# .env Datei erstellen
cp env.example .env

# Werte anpassen
```

### Entwicklung

```bash
npm run dev
```

Server startet auf http://localhost:5173

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔧 Konfiguration

### Vite Config

- Proxy für API-Calls auf localhost:3000
- Alias `@` für src/ Verzeichnis
- Vue Plugin für Single File Components

### ESLint

- Vue 3 spezifische Regeln
- Modern JavaScript Support
- Auto-fix verfügbar

### Umgebungsvariablen

- Zentrale Konfiguration über `.env` Datei
- Environment-spezifische Werte
- Feature Flags für Debug-Modus
- Sichere Handhabung sensibler Daten

## 📦 Komponenten-Übersicht

### Layout-Komponenten

- **AppHeader**: Hauptnavigation und Header-Bereich
- **AppFooter**: Footer-Bereich mit Links und Informationen

### Listen-Komponenten

- **AnswerList**: Anzeige von Antworten und Kommentaren
- **BasarList**: Hauptkomponente für die Basar-Übersicht
- **GamesList**: Anzeige von Spielen und deren Details
- **HistoryList**: Historie und Verlauf von Aktionen
- **LinkList**: Verwaltung von Links und Verweisen
- **LinkViewList**: Anzeige von Link-Views
- **SRList**: Schiedsrichter-Listen und -Verwaltung

### Services

- **api-client**: Zentrale API-Kommunikation
- **auth.service**: Authentifizierung und Session-Management
- **games.service**: Spiele-bezogene API-Calls
- **ical.service**: iCal-Export und Kalender-Integration
- **link.service**: Link-Management
- **user.service**: Benutzer-Verwaltung

## 🎯 Best Practices

### Styling

- Alle Styles sind in den jeweiligen Vue-Komponenten
- Globale Styles nur für Bootstrap-Overrides
- CSS-Variablen für konsistente Farben
- Mobile-first Responsive Design

### Komponenten

- Composition API für bessere TypeScript-Unterstützung
- Props-Validierung für alle Komponenten
- Emits-Deklaration für Events
- Scoped Styles für Komponenten-Isolation

### Performance

- Lazy Loading für Routes
- Tree-shaking für ungenutzte Dependencies
- Optimierte Bundle-Größe durch Vite
- Code-Splitting für bessere Ladezeiten

### Konfiguration

- Umgebungsvariablen für alle API-URLs
- Zentrale Config-Service
- Environment-spezifische Werte
- Sichere Handhabung sensibler Daten

## 🐛 Troubleshooting

### Häufige Probleme

1. **Port bereits belegt**: Ändern Sie den Port in `vite.config.js`
2. **CORS-Probleme**: Proxy ist in Vite konfiguriert
3. **Bootstrap nicht geladen**: Prüfen Sie die Imports in `main.js`
4. **API-Calls schlagen fehl**: Prüfen Sie die `.env` Konfiguration

### Debugging

```bash
# Lint-Fehler anzeigen
npm run lint

# Build-Details
npm run build -- --debug

# Umgebungsvariablen prüfen
VITE_ENABLE_DEBUG_MODE=true npm run dev
```

## 📝 Changelog

### v0.1.0 - Initial Release

- Vue 3.5.18 mit Composition API
- Vite 7.0.6 als Build-Tool
- Bootstrap 5.3.7 für UI
- Tabulator Tables für erweiterte Tabellen
- Vue Multiselect für Auswahl-Felder
- Font Awesome 7.0.0 für Icons
- Modulare Service-Struktur
- Vuex 4.1.0 für State Management
- Umgebungsvariablen-Konfiguration
- ESLint für Code-Qualität

---

**Entwickelt mit ❤️ von Dirk Drutschmann**  
📧 [mail@drutschmann.dev](mailto:mail@drutschmann.dev) | 📄 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
