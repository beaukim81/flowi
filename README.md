# Flowi

Flowi is een Nederlandse local-first webapp/PWA voor kinderen van 4 tot 12 jaar. De app helpt met voelen, kiezen, kleine rustacties, dagstructuur, routines en zachte beloningen.

## Installeren

```bash
npm install
npm run dev
```

Build testen:

```bash
npm run build
npm run preview
```

## Vercel deployment

1. Maak een nieuwe GitHub-repository, bijvoorbeeld `flowi`.
2. Push deze projectmap naar die repository.
3. Open Vercel en kies **New Project**.
4. Selecteer de GitHub-repository.
5. Gebruik:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
6. Deploy.

Flowi gebruikt geen backend, geen account, geen tracking en geen externe database.

## Lokale opslag

Belangrijke appdata wordt opgeslagen in IndexedDB via Dexie in database `FlowiDB`. Dit bevat onder andere profiel, instellingen, avatar, emoties, taken, taakstatussen, reflecties, beloningen en backups. `localStorage` wordt alleen licht gebruikt voor de tijdelijke check-in flow.

Data blijft bewaard na refresh, sluiten en opnieuw openen. Data verdwijnt alleen als de gebruiker browser-/appdata wist, de app verwijdert of handmatig reset.

## Backup/export

Ga in de app naar **Meer > Backup**.

- **Backup maken** exporteert alle appdata als JSON met bestandsnaam `flowi-backup-[datum].json`.
- **Backup terugzetten** importeert een Flowi JSON-backup en vervangt de huidige lokale gegevens op dit apparaat.

## PWA

Flowi bevat een webmanifest en service worker via `vite-plugin-pwa`. De PWA-cache is bedoeld voor app-assets. Persoonlijke data blijft in IndexedDB en wordt niet in de app-cache opgeslagen.

## Android met Capacitor

Android app-id placeholder: `nl.flowi.app`.

```bash
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
Controleer `capacitor.config.ts` met app-id `nl.flowi.app`.
npx cap add android
npx cap sync android
npx cap open android
```

Maak daarna een signed Android App Bundle (`.aab`) via Android Studio.

Er zijn bewust geen iOS-instructies opgenomen.

## Productregels

- Geen externe database
- Geen backend
- Geen accounts of login
- Geen tracking of advertenties
- Geen live AI-chat
- Geen medische claims of diagnosefunctie
- Geen pushmeldingen in de MVP
- Mobile-first en responsive
- Local-first met JSON export/import
