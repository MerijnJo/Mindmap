# User Test Matrix: MindFlow doelgroep 10-15 jaar

## 1. Testdoel

Valideren of leerlingen van 10-15 jaar zelfstandig een mindmap kunnen maken, verrijken met afbeeldingen, AI-feedback begrijpen en hun mindmap kunnen exporteren.

## 2. Doelgroep Matrix

| Segment | Leeftijd | Aantal | Profiel | Waarom testen |
| --- | --- | ---: | --- | --- |
| Jong | 10-11 | 2 | Basisschool / brugklas, beperkte digitale ervaring mogelijk | Test of taal, knoppen en AI-feedback simpel genoeg zijn |
| Midden | 12-13 | 2 | Onderbouw, gewend aan schoolopdrachten en apps | Kerngebruikers voor schoolcontext |
| Oud | 14-15 | 2 | Meer zelfstandigheid, kritischer op nut en snelheid | Test of app nog serieus en bruikbaar voelt |
| Extra | 10-15 | 2-4 | Mix van mindmap/AI ervaring | Meer zekerheid op patronen |

Minimum: 5 deelnemers. Aanbevolen: 6-10 deelnemers.

## 3. Test Matrix

Score:

- `0` = niet gelukt
- `1` = gelukt met veel hulp
- `2` = gelukt met kleine hint
- `3` = zelfstandig gelukt

| ID | Flow | Testtaak voor deelnemer | Hypothese | Succescriterium | Meetmethode | Prioriteit |
| --- | --- | --- | --- | --- | --- | --- |
| T01 | Eerste indruk | Kijk naar het scherm. Waar zou je beginnen? | Leerlingen begrijpen dat ze in het eerste vakje kunnen starten | Deelnemer benoemt of gebruikt root node binnen 30 sec | Observatie + tijd | Hoog |
| T02 | Root node | Typ een hoofdonderwerp in het eerste vakje | Root node voelt als hoofdonderwerp | Deelnemer vult hoofdonderwerp zelfstandig in | Score 0-3 | Hoog |
| T03 | Node toevoegen | Voeg 3 kleinere ideeen toe | Plusknop is vindbaar en begrijpelijk | Minimaal 3 child nodes aangemaakt | Score 0-3 + aantal nodes | Hoog |
| T04 | Structuur begrijpen | Leg uit wat de lijnen tussen vakjes betekenen | Edges worden begrepen als verbanden | Deelnemer noemt "hoort bij", "verbonden", "gaat over" of vergelijkbaar | Antwoord coderen | Hoog |
| T05 | Node bewerken | Verander de tekst van een idee | Inline editing is duidelijk | Deelnemer past bestaand label aan | Score 0-3 | Hoog |
| T06 | Node verplaatsen | Zet een idee op een logischere plek | Drag-interactie is vindbaar | Deelnemer verplaatst niet-root node | Score 0-3 | Middel |
| T07 | Node verwijderen | Verwijder een idee dat je niet nodig hebt | Delete/backspace is voldoende ontdekbaar | Deelnemer verwijdert node of vraagt logisch naar verwijderen | Score 0-3 + observatie | Middel |
| T08 | Afbeelding toevoegen | Voeg een afbeelding toe aan een idee | Image-knop wordt begrepen | Afbeelding verschijnt in node | Score 0-3 + foutregistratie | Hoog |
| T09 | Afbeelding beoordelen | Past de afbeelding bij je idee? | Afbeeldingen ondersteunen begrip | Deelnemer kan zeggen of afbeelding wel/niet past | Kwalitatieve quote | Middel |
| T10 | AI Coach openen | Open de AI Coach | Coach-knop is vindbaar | Deelnemer opent panel zelfstandig | Score 0-3 | Hoog |
| T11 | AI analyse starten | Laat de AI naar je mindmap kijken | `Analyze Mind Map` is begrijpelijk genoeg | Deelnemer start analyse | Score 0-3 + tijd | Hoog |
| T12 | AI-feedback begrijpen | Vertel wat de AI Coach bedoelt | Feedback is begrijpelijk voor 10-15 jaar | Deelnemer kan minimaal 1 advies correct navertellen | Begrip: ja/deels/nee | Hoog |
| T13 | AI-feedback toepassen | Pas 1 tip van de AI toe | Feedback leidt tot concrete verbetering | Deelnemer maakt node/label/positie/verbinding-wijziging | Score 0-3 + type wijziging | Hoog |
| T14 | AI toon | Hoe voelde de feedback? | AI voelt helpend, niet beoordelend | Deelnemer kiest positief/neutraal en noemt geen schaamtegevoel | Korte rating + quote | Hoog |
| T15 | Follow-up | Klik op een vervolgvraag | Follow-up prompts zijn bruikbaar | Deelnemer gebruikt prompt en begrijpt antwoord | Score 0-3 | Middel |
| T16 | Engelse termen | Wijs woorden aan die je niet snapt | Engelse UI-termen kunnen frictie geven | Onduidelijke woorden worden zichtbaar | Woordenlijst | Hoog |
| T17 | Export | Download je mindmap als afbeelding | Exportknop is vindbaar en resultaat bruikbaar | PNG wordt gedownload | Score 0-3 | Hoog |
| T18 | Eindwaarde | Zou je dit gebruiken voor school? Waarom? | Product heeft schoolwaarde | Deelnemer noemt concrete schooltoepassing of reden van afwijzing | Interviewcode | Middel |

## 4. Feature Coverage Matrix

| Feature | Taken | Kritiek voor MVP | Belangrijkste risico |
| --- | --- | --- | --- |
| Canvas start | T01, T02 | Ja | Leerling weet niet waar te beginnen |
| Node creatie | T03 | Ja | Plusknop wordt niet gezien |
| Structuur/edges | T04 | Ja | Lijnen voelen decoratief of onduidelijk |
| Editing | T05 | Ja | Leerling begrijpt niet dat tekst direct bewerkbaar is |
| Dragging | T06 | Nee | Drag-handle wordt gemist |
| Delete | T07 | Nee | Geen zichtbare verwijderknop |
| Images | T08, T09 | Ja | Image-knop of foutstatus is onduidelijk |
| AI Coach | T10, T11 | Ja | Coach wordt niet gevonden of analyseknop is onduidelijk |
| AI begrip | T12, T14 | Ja | Feedback is te moeilijk, te Engels of voelt beoordelend |
| AI actie | T13 | Ja | Leerling weet niet wat te wijzigen |
| Follow-up | T15 | Nee | Prompts zijn te abstract of te Engels |
| Taal | T16 | Ja | Belangrijke termen worden niet begrepen |
| Export | T17 | Ja | `Export PNG` wordt niet begrepen |
| Productwaarde | T18 | Nee | App voelt leuk maar niet nuttig voor school |

## 5. Risico Matrix

| Risico | Kans | Impact | Detectie in test | Mogelijke oplossing |
| --- | --- | --- | --- | --- |
| Leerling ziet plusknop niet | Middel | Hoog | T03 score 0-1 | Plusknop zichtbaarder maken, label of toolbar toevoegen |
| Root node wordt niet begrepen | Laag-Middel | Hoog | T01/T02 vertraging of verkeerde klik | Placeholder aanpassen naar "Typ je hoofdonderwerp" |
| Engelse termen zijn te moeilijk | Hoog | Middel-Hoog | T16 veel woorden genoemd | UI volledig Nederlands maken of taalkeuze toevoegen |
| AI-feedback is te abstract | Middel | Hoog | T12 deels/nee, T13 score 0-1 | Prompt aanscherpen, feedback koppelen aan concrete node |
| AI voelt als beoordeling | Laag-Middel | Hoog | T14 negatieve quote | Toon zachter maken, meer "probeer" en minder oordeel |
| Afbeelding past niet | Middel | Middel | T09 negatieve beoordeling | Alternatieven tonen of zoekterm laten aanpassen |
| Export wordt niet begrepen | Middel | Middel | T17 score 0-1 | Label wijzigen naar "Download afbeelding" |
| Geen opslag veroorzaakt werkverlies | Middel | Hoog | Spontane opmerkingen of refresh-incident | LocalStorage toevoegen |
| Delete is onvindbaar | Hoog | Middel | T07 score 0-1 | Zichtbare delete-actie toevoegen |

## 6. Metrics Matrix

| Metric | Definitie | Doelwaarde MVP | Taken |
| --- | --- | ---: | --- |
| Start success rate | % deelnemers dat root topic invult zonder hulp | 80% | T01, T02 |
| Node creation success rate | % deelnemers dat 3 nodes toevoegt met max 1 hint | 80% | T03 |
| Structure comprehension | % deelnemers dat lijnen correct uitlegt | 70% | T04 |
| Image success rate | % deelnemers dat afbeelding toevoegt met max 1 hint | 70% | T08 |
| AI discoverability | % deelnemers dat AI Coach opent met max 1 hint | 70% | T10 |
| AI comprehension | % deelnemers dat feedback correct navertelt | 70% | T12 |
| AI actionability | % deelnemers dat feedback omzet naar wijziging | 60% | T13 |
| Export success rate | % deelnemers dat PNG downloadt met max 1 hint | 70% | T17 |
| Confusing term count | Gemiddeld aantal onduidelijke UI-termen per deelnemer | Max 2 | T16 |
| School usefulness | % deelnemers dat concrete schooltoepassing noemt | 60% | T18 |

## 7. Taakresultaten Matrix

Gebruik deze tabel per deelnemer.

| Test ID | Leeftijd | T01 | T02 | T03 | T04 | T05 | T06 | T07 | T08 | T09 | T10 | T11 | T12 | T13 | T14 | T15 | T16 | T17 | T18 |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- | ---: | --- | ---: | --- | ---: | --- |
| P01 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| P02 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| P03 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| P04 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| P05 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| P06 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

Legenda:

- Taken met score gebruiken `0-3`.
- T04, T09, T12, T14, T16 en T18 worden kwalitatief gecodeerd.

## 8. Kwalitatieve Code Matrix

| Code | Betekenis | Voorbeeld |
| --- | --- | --- |
| `TERM_CONFUSION` | Woord of label wordt niet begrepen | "Wat betekent export?" |
| `BUTTON_MISSED` | Knop wordt niet gezien | Plusknop niet gevonden |
| `WRONG_EXPECTATION` | Verwachting klopt niet met resultaat | Denkt dat AI zelf nodes maakt |
| `AI_TOO_HARD` | AI-tekst is te moeilijk | Kan advies niet navertellen |
| `AI_HELPFUL` | AI helpt concreet | Past mindmap aan na tip |
| `AI_JUDGMENT` | AI voelt beoordelend | "Ik deed het fout" |
| `IMAGE_HELPFUL` | Afbeelding ondersteunt idee | "Nu zie je beter wat ik bedoel" |
| `IMAGE_IRRELEVANT` | Afbeelding past niet | Afbeelding toont verkeerd onderwerp |
| `EXPORT_CONFUSION` | Download/export is onduidelijk | Weet niet wat PNG is |
| `SCHOOL_VALUE` | Deelnemer ziet schooltoepassing | "Voor een presentatie" |

## 9. Hint Matrix

| Hintniveau | Betekenis | Voorbeeld |
| --- | --- | --- |
| H0 | Geen hint | Deelnemer lukt taak zelfstandig |
| H1 | Algemene hint | "Waar zou je klikken om iets toe te voegen?" |
| H2 | Gerichte hint | "Zie je ergens een plusknop?" |
| H3 | Directe instructie | "Klik op de plusknop naast het vakje" |

Registreer per taak:

- Score `0-3`
- Hintniveau `H0-H3`
- Tijd tot succes
- Opmerking of quote

## 10. Issue Prioritization Matrix

| Ernst | Criteria | Voorbeeld |
| --- | --- | --- |
| P0 | Blokkeert kerntaak voor meerdere deelnemers | Meerdere leerlingen kunnen geen nodes toevoegen |
| P1 | Blokkeert belangrijke taak of veroorzaakt veel hulp | AI Coach wordt niet gevonden |
| P2 | Taak lukt, maar met duidelijke verwarring | Export lukt pas na uitleg van PNG |
| P3 | Kleine verbetering of polish | Knoptekst kan duidelijker |

Gebruik deze beslissing:

| Frequentie | Ernst | Actie |
| --- | --- | --- |
| 3+ deelnemers | P0/P1 | Voor volgende test oplossen |
| 2+ deelnemers | P1/P2 | In backlog met hoge prioriteit |
| 1 deelnemer | P1 | Check in volgende test |
| 1-2 deelnemers | P2/P3 | Lage prioriteit tenzij makkelijk op te lossen |

## 11. Testdata Template

| Veld | Waarde |
| --- | --- |
| Test ID |  |
| Datum |  |
| Leeftijd |  |
| Leerjaar |  |
| Apparaat |  |
| Browser |  |
| Onderwerp mindmap |  |
| Aantal nodes eind |  |
| Aantal afbeeldingen eind |  |
| AI gebruikt | Ja / Nee |
| Export gelukt | Ja / Nee |
| Grootste blokkade |  |
| Beste quote |  |
| Belangrijkste verbetering |  |

## 12. Samenvattende Resultaten Matrix

| Onderdeel | Succespercentage | Belangrijkste probleem | Prioriteit | Aanbevolen actie |
| --- | ---: | --- | --- | --- |
| Start/root topic |  |  |  |  |
| Nodes toevoegen |  |  |  |  |
| Structuur begrijpen |  |  |  |  |
| Node bewerken |  |  |  |  |
| Node verplaatsen |  |  |  |  |
| Afbeeldingen |  |  |  |  |
| AI Coach vinden |  |  |  |  |
| AI-feedback begrijpen |  |  |  |  |
| AI-feedback toepassen |  |  |  |  |
| Follow-up prompts |  |  |  |  |
| Taal/terminologie |  |  |  |  |
| Export |  |  |  |  |
| Schoolwaarde |  |  |  |  |

## 13. Open Beslispunten

| Vraag | Waarom belangrijk | Beslissing nodig |
| --- | --- | --- |
| Wordt de UI Nederlands, Engels of tweetalig? | Doelgroep kan moeite hebben met Engelse termen | Voor volgende testronde |
| Moet `Export PNG` worden hernoemd? | PNG/export kan onduidelijk zijn | Na T17/T16 |
| Moet AI Coach zelf nodes mogen voorstellen? | Kan nuttig zijn, maar neemt mogelijk denkwerk over | Productbesluit |
| Moet verwijderen zichtbaarder worden? | Delete via toetsenbord is mogelijk niet ontdekbaar | Na T07 |
| Moet opslag in MVP? | Werkverlies is groot risico | Roadmap/MVP-besluit |
