# Flowi Play Store Submission Checklist

Dit is de laatste lijst om Flowi echt klaar te zetten voor Google Play.

## Technisch al op orde

- Android project aanwezig
- `targetSdkVersion` = 35
- privacybeleid publiek beschikbaar
- kind- en veiligheidspagina publiek beschikbaar
- local-first opslag
- offline bruikbaar

## Vastgezet voor publicatie

- Publieke aanbieder: `Flowi by Kim`
- Publiek support e-mailadres: `mailz4kim@gmail.com`
- Developer account:
  - nog aan te maken
  - valt daardoor onder de nieuwere Play Console-regels voor persoonlijke accounts

## Nog open keuzes

1. Optionele website of supportpagina
   - mag leeg blijven als je voorlopig alleen e-mail wilt gebruiken
2. Wil je later alsnog publiceren onder:
   - alleen `Flowi by Kim`
   - of een toekomstige studio-/bedrijfsnaam

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

Omdat jouw Play developer account nog gemaakt moet worden en dus onder de nieuwere regels valt, vraagt Google meestal eerst:

- een closed test
- met minimaal 12 testers
- die 14 dagen achter elkaar ingeschreven blijven

## Aanbevolen laatste inhoudelijke check

- check of alle ouderteksten rustig en niet-belerend blijven
- check of alle hulpflows logisch blijven van emotie -> behoefte -> oefening
- check of privacy- en veiligheidsuitleg exact klopt met wat de app echt doet
