# Flowi Play Store Submission Checklist

Dit is de laatste lijst om Flowi echt klaar te zetten voor Google Play.

## Technisch al op orde

- Android project aanwezig
- `targetSdkVersion` = 35
- privacybeleid publiek beschikbaar
- kind- en veiligheidspagina publiek beschikbaar
- local-first opslag
- offline bruikbaar

## Nog invullen door Kim

Deze gegevens heb ik nog van je nodig om het echt netjes af te ronden:

1. Publieke naam van de aanbieder
   - Voorbeeld: `Kim [achternaam]`
   - Of een studio-/bedrijfsnaam

2. Publiek contact e-mailadres
   - Voor privacybeleid
   - Voor Play Store-vermelding

3. Optionele website of supportpagina
   - Mag ook leeg blijven als je alleen e-mail wilt gebruiken

4. Wil je Flowi publiceren als:
   - een persoonlijke ontwikkelaar
   - of namens een bedrijf / merknaam

5. Is jouw Google Play developer account:
   - aangemaakt na 13 november 2023
   - of ouder dan die datum

## In Play Console invullen

### App content

- Privacy Policy URL:
  - live URL van `/privacy-policy`
- Ads:
  - `Nee`, zolang Flowi geen advertenties bevat
- App access:
  - `Geen login vereist`
- Target audience and content:
  - kinderen / families / volwassen begeleiding
- Content rating:
  - rustig, kindvriendelijk, geen geweld, geen gokken, geen open chat
- Data safety:
  - lokale opslag van routines, vinkjes, emoties, oefeningen en backups
  - geen account
  - geen verkoop van data
  - geen camera, microfoon of locatie voor de kern van de app

## Android release

Voor upload naar Google Play moet nog:

1. release signing instellen in Android Studio
2. een signed Android App Bundle (`.aab`) maken
3. definitieve appnaam, beschrijving, screenshots en icoon uploaden
4. testen op meerdere Android schermformaten

## Belangrijke opmerking

Als jouw Play developer account een persoonlijk account is dat na 13 november 2023 is aangemaakt, vraagt Google meestal eerst:

- een closed test
- met minimaal 12 testers
- die 14 dagen achter elkaar ingeschreven blijven

## Aanbevolen laatste inhoudelijke check

- check of alle ouderteksten rustig en niet-belerend blijven
- check of alle hulpflows logisch blijven van emotie -> behoefte -> oefening
- check of privacy- en veiligheidsuitleg exact klopt met wat de app echt doet
