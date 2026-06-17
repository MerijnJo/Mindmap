# Onderzoek: Realtime samenwerken aan dezelfde mindmap

## Onderzoeksvraag

Hoe kan MindFlow zo worden ingericht dat meerdere gebruikers met een korte code dezelfde mindmap kunnen openen en realtime samen kunnen bewerken, waarbij wijzigingen bij alle gebruikers zichtbaar zijn en de kosten, hosting, API-gebruik en privacy beheersbaar blijven?

## Context

MindFlow is nu een persoonlijke mindmap-app. De huidige PRD noemt realtime samenwerking bewust als functie buiten de MVP. Voor een volgende fase is samenwerking logisch: leerlingen kunnen dan in groepjes brainstormen, een docent kan meekijken en veranderingen hoeven niet via screenshots of exports gedeeld te worden.

De functie moet wel passen bij de doelgroep van 10 tot 15 jaar. Daarom is een simpele join-code beter dan volledige accountregistratie. De gebruiker hoeft alleen een sessiecode in te voeren, waarna de bestaande mindmap wordt geladen en live wordt bijgewerkt.

## DOT Framework

### 1. Library

Doel: onderzoeken welke bestaande oplossingen geschikt zijn voor realtime samenwerking.

Gebruikte ICT research methods:

- Literature study: documentatie bekijken van realtime frameworks, hostingplatformen en prijsmodellen.
- Best good and bad practices: vergelijken welke architecturen vaak gebruikt worden voor collaborative tools.
- Available product analysis: bestaande diensten beoordelen op bruikbaarheid voor MindFlow.

Belangrijke opties:

1. Supabase Realtime
   Supabase biedt Broadcast, Presence en Postgres Changes. Broadcast is bruikbaar voor live wijzigingen, Presence voor online gebruikers en cursors, en Postgres voor opslag. Dit past goed bij een MVP omdat database, realtime berichten en eventueel authenticatie in een platform zitten.

2. Eigen Node.js WebSocket-server
   De huidige backend is al Node.js/Express. Daar kan een WebSocket-laag aan toegevoegd worden met bijvoorbeeld `ws` of Socket.IO. Dit geeft veel controle, maar vraagt meer eigen beheer: reconnects, room-state, validatie, opslag, schaalbaarheid en beveiliging moeten grotendeels zelf worden gebouwd.

3. Yjs met WebSocket-provider
   Yjs is gemaakt voor collaborative apps en gebruikt CRDT's. Dat betekent dat gelijktijdige wijzigingen beter kunnen worden samengevoegd, ook als gebruikers kort offline zijn. Dit is technisch sterker dan simpele event-sync, maar vraagt meer begrip van gedeelde datastructuren.

4. Liveblocks of vergelijkbare realtime collaboration service
   Dit soort diensten leveren presence, storage en realtime samenwerking als product. Dat versnelt ontwikkeling, maar maakt MindFlow afhankelijker van een externe betaalde dienst.

Voor MindFlow is Supabase Realtime de meest praktische eerste keuze. Het is snel te testen, bevat zowel realtime communicatie als opslag, en houdt de infrastructuur overzichtelijk. Yjs is een sterke tweede keuze als gelijktijdig bewerken complexer wordt, bijvoorbeeld wanneer meerdere leerlingen tegelijk dezelfde node tekst aanpassen.

### 2. Field

Doel: onderzoeken wat gebruikers en stakeholders nodig hebben.

Gebruikte ICT research methods:

- Stakeholder interview: korte gesprekken met docent, leerling en ontwikkelaar.
- User interview: vragen hoe leerlingen verwachten samen te werken.
- Survey: korte vragenlijst na een klassikale test.
- Task analysis: observeren welke stappen nodig zijn om een mindmap te delen.

Onderzoeksvragen voor gebruikers:

- Begrijpen leerlingen direct wat een join-code is?
- Moet de maker van een mindmap andere gebruikers kunnen verwijderen?
- Is anoniem samenwerken voldoende, of willen docenten namen zien?
- Moet iedereen alles mogen aanpassen, of is er een verschil tussen eigenaar, editor en viewer?
- Is tijdelijke opslag genoeg, of moeten mindmaps later opnieuw geopend kunnen worden?

Verwachting:

Voor een schoolcontext is de beste eerste flow:

- Een gebruiker klikt op `Delen`.
- De app maakt een korte code, bijvoorbeeld `MIND-4821`.
- Andere gebruikers voeren deze code in.
- Iedereen ziet dezelfde nodes, edges, afbeeldingen en AI-feedbackstatus.
- De app toont wie online is met simpele namen zoals `Leerling 1`, `Leerling 2`.

Accounts zijn voor de eerste versie niet nodig. Ze verhogen privacy- en ontwikkelcomplexiteit. Voor docentgebruik kan later een docentaccount of klassikale sessie toegevoegd worden.

### 3. Workshop

Doel: technische haalbaarheid valideren met prototypes.

Gebruikte ICT research methods:

- Prototyping: een kleine samenwerkingsfunctie bouwen zonder volledige productkwaliteit.
- Technical feasibility test: meten of wijzigingen snel genoeg synchroniseren.
- Code review: beoordelen of de oplossing onderhoudbaar is.
- Security test: controleren of join-codes niet makkelijk misbruikt worden.

Prototype 1: Supabase Realtime

- Maak een tabel `mindmaps` met `id`, `join_code`, `created_at`, `expires_at`.
- Maak een tabel `mindmap_events` of `mindmap_snapshots`.
- Laat clients joinen op een realtime channel per mindmap.
- Verstuur bewerkingen als events: node toegevoegd, node verplaatst, label aangepast, edge toegevoegd, node verwijderd.
- Sla periodiek een snapshot op zodat nieuwe gebruikers de huidige staat kunnen laden.

Prototype 2: Node.js WebSocket

- Voeg een WebSocket-server toe naast Express.
- Gebruik rooms per join-code.
- Bewaar room-state tijdelijk in geheugen.
- Broadcast wijzigingen naar alle clients in dezelfde room.
- Voeg later database-opslag toe.

Prototype 3: Yjs

- Modelleer nodes en edges als gedeelde Yjs-documentstructuur.
- Gebruik awareness voor cursors en online gebruikers.
- Test gelijktijdige wijzigingen aan dezelfde node.

Meetpunten:

- Ziet een tweede gebruiker een node-verplaatsing binnen 300 ms?
- Blijft de mindmap consistent bij twee gelijktijdige bewerkingen?
- Kan een nieuwe gebruiker de volledige bestaande mindmap laden?
- Werkt reconnect na kort internetverlies?
- Blijft de UI begrijpelijk voor leerlingen?

### 4. Lab

Doel: objectief testen of de gekozen oplossing goed genoeg werkt.

Gebruikte ICT research methods:

- Performance test: veel wijzigingen en meerdere gebruikers simuleren.
- Load test: testen met bijvoorbeeld 5, 10, 25 en 50 gelijktijdige gebruikers per mindmap.
- Usability test: leerlingen laten samenwerken aan een opdracht.
- A/B test: join-code flow vergelijken met deelbare link.
- Risk analysis: risico's rond privacy, kosten en misbruik in kaart brengen.

Testscenario's:

- Twee leerlingen bewerken tegelijk verschillende nodes.
- Twee leerlingen bewerken tegelijk dezelfde node.
- Een leerling verplaatst snel meerdere nodes.
- Een leerling sluit de browser en opent de code opnieuw.
- Een leerling voert een verkeerde of verlopen code in.
- De AI Coach wordt gebruikt terwijl meerdere gebruikers online zijn.

Acceptatiecriteria:

- Wijzigingen zijn binnen ongeveer een halve seconde zichtbaar bij andere gebruikers.
- Nieuwe gebruikers krijgen bij joinen de actuele mindmap te zien.
- Bij netwerkverlies raakt de mindmap niet direct corrupt.
- De app voorkomt dat iedereen zomaar oude sessies kan raden.
- De kosten blijven voorspelbaar bij een kleine schooltest.

## Functioneel advies

Advies voor versie 1:

- Gebruik een join-code zonder account.
- Laat een sessie tijdelijk bestaan, bijvoorbeeld 24 uur of 7 dagen.
- Geef alle deelnemers standaard bewerkrechten.
- Toon online deelnemers met eenvoudige namen of kleuren.
- Sla mindmaps server-side op als snapshot plus recente events.
- Maak AI-analyse alleen handmatig, niet automatisch bij elke wijziging.

Waarom geen automatische AI-analyse bij elke wijziging:

AI-kosten kunnen snel oplopen als iedere node-aanpassing een analyse triggert. Bovendien kan continue AI-feedback onrustig zijn voor leerlingen. Een knop zoals `Vraag feedback` houdt de leerling eigenaar en maakt kosten beter voorspelbaar.

## Toepassingen op schaal

Wanneer MindFlow niet alleen als demo wordt gebruikt, maar door meerdere scholen en groepen tegelijk, verandert de functie van "samen een mindmap testen" naar een onderwijsplatform voor klassikale en schoolbrede samenwerking.

### 1. Groepsopdracht binnen een les

Een docent verdeelt de klas in groepjes van 3 tot 5 leerlingen. Elk groepje krijgt een eigen mindmap-code en werkt tegelijk aan een onderwerp, bijvoorbeeld geschiedenis, biologie of Nederlands.

Toepassing:

- De docent zet per groep een sessie klaar.
- Leerlingen joinen met een code.
- Iedereen in het groepje kan nodes toevoegen en verplaatsen.
- De docent kan meekijken zonder zelf te bewerken.
- Aan het einde exporteert het groepje de mindmap als PNG of levert de opgeslagen link in.

Waarde:

- Leerlingen hoeven niet op een gedeeld scherm te werken.
- De docent ziet beter wie vastloopt.
- Groepswerk wordt zichtbaarder dan bij een gewone brainstorm op papier.

Benodigde functies:

- Join-code per groep.
- Online deelnemers tonen.
- Read-only docentmodus.
- Sessie-overzicht voor docent.
- Export of inleverlink.

### 2. Klassikale brainstorm

De hele klas werkt in dezelfde mindmap of in meerdere thematische mindmaps. Dit past bij het starten van een nieuw onderwerp.

Toepassing:

- De docent maakt een hoofdonderwerp aan, bijvoorbeeld `Klimaatverandering`.
- Leerlingen voegen individueel ideeen toe.
- De docent ordent later de belangrijkste takken.
- AI Coach kan helpen om ontbrekende categorieen of onduidelijke verbanden te vinden.

Waarde:

- Iedereen kan tegelijk bijdragen, ook stillere leerlingen.
- De docent krijgt snel inzicht in voorkennis.
- De mindmap kan later als lesmateriaal worden gebruikt.

Risico:

- Bij te veel leerlingen in een mindmap kan het canvas chaotisch worden.
- Daarom is het verstandig om bij meer dan 8 tot 10 leerlingen subgroepen te gebruiken.

### 3. Project tussen meerdere klassen of scholen

Meerdere klassen werken aan hetzelfde thema, bijvoorbeeld duurzaamheid, mediawijsheid of burgerschap. Elke klas kan een eigen mindmap maken, waarna resultaten worden vergeleken.

Toepassing:

- Elke school of klas krijgt een eigen workspace.
- Docenten maken sessies aan voor projecten.
- Mindmaps kunnen read-only gedeeld worden met andere klassen.
- Alleen docenten of groepsleden mogen bewerken.

Waarde:

- Geschikt voor projectweken en vakoverstijgend onderwijs.
- Leerlingen zien hoe andere groepen hetzelfde onderwerp structureren.
- De tool wordt meer dan een losse lesactiviteit.

Benodigde functies:

- Organisaties of scholen als tenant.
- Rollen: schoolbeheerder, docent, leerling, viewer.
- Rechten per mindmap.
- Beperkte bewaartermijn of archief.

### 4. Begeleiding door docent of mentor

Een docent of mentor kan live meekijken met een leerling die een presentatie, verslag of leerstrategie voorbereidt.

Toepassing:

- Leerling deelt een code met docent.
- Docent ziet de mindmap en kan eventueel opmerkingen plaatsen.
- AI Coach geeft alleen ondersteunende vragen, geen kant-en-klare antwoorden.

Waarde:

- Geschikt voor leerlingen die moeite hebben met plannen of structureren.
- Docenten kunnen gerichter feedback geven.
- De mindmap kan onderdeel worden van formatieve evaluatie.

### 5. Thuis verder werken

Leerlingen starten in de les en werken thuis verder, alleen of met groepsgenoten.

Toepassing:

- De mindmap blijft na de les tijdelijk beschikbaar.
- De groep gebruikt dezelfde code of een beveiligde link.
- De docent kan een deadline instellen.

Waarde:

- Minder werkverlies.
- Groepsopdrachten hoeven niet binnen een lesuur af te zijn.
- Ouders of begeleiders kunnen eventueel meekijken via read-only link.

Voorwaarde:

Zodra mindmaps langer bewaard worden, worden privacy, bewaartermijn en toestemming belangrijker. Voor een echte schooluitrol is dan een duidelijk databeleid nodig.

## Schaalmodel voor meerdere scholen

Voor een schaalbare inrichting is het verstandig om MindFlow multi-tenant te ontwerpen. Dat betekent dat meerdere scholen hetzelfde platform gebruiken, maar dat data logisch gescheiden blijft.

Aanbevolen structuur:

```text
organizations
- id
- name
- type: school / demo / internal
- created_at

classes
- id
- organization_id
- name
- school_year

users
- id
- organization_id
- role: admin / teacher / student
- display_name

mindmaps
- id
- organization_id
- class_id
- owner_id
- title
- join_code_hash
- access_mode: private / code / read_only_link
- expires_at
- latest_snapshot_json

mindmap_participants
- id
- mindmap_id
- user_id_or_guest_id
- role: owner / editor / viewer
- last_seen_at
```

Voor de eerste echte uitrol hoeft niet iedere leerling meteen een account te hebben. Een praktische tussenstap is:

- Docenten hebben wel accounts.
- Leerlingen joinen met code en tijdelijke naam.
- Mindmaps hangen aan docent, klas en school.
- De school bepaalt bewaartermijn en AI-toegang.

Dit houdt de leerlingflow simpel, maar geeft scholen genoeg controle.

## Technisch advies

Aanbevolen architectuur:

1. Frontend
   React Flow blijft verantwoordelijk voor canvas, nodes en edges. Iedere lokale actie wordt omgezet naar een collaboration event.

2. Realtime laag
   Supabase Realtime of WebSocket rooms sturen events naar deelnemers in dezelfde mindmap.

3. Opslag
   Een database bewaart mindmap-snapshots. Nieuwe gebruikers laden eerst de laatste snapshot en ontvangen daarna live events.

4. Join-code service
   De backend maakt korte codes aan, bewaart de koppeling met een mindmap-id en controleert of de code nog geldig is.

5. AI backend
   AI blijft via de eigen backend lopen. Alleen de actuele mindmap wordt bij een expliciete analyse naar het AI-model gestuurd.

Datamodel op hoofdlijnen:

```text
mindmaps
- id
- join_code_hash
- title
- created_at
- expires_at
- latest_snapshot_json

mindmap_events
- id
- mindmap_id
- actor_id
- event_type
- payload_json
- created_at

mindmap_participants
- id
- mindmap_id
- display_name
- color
- last_seen_at
```

Belangrijk: sla de join-code liever niet als platte tekst op. Een hash is veiliger als de database ooit uitlekt.

## Uitgebreide kostenanalyse

De kosten van een opgeschaalde versie bestaan niet uit een onderdeel. Ze komen uit hosting, database, realtime verkeer, AI, afbeeldingzoekactie, monitoring, support en beheer. Voor scholen is voorspelbaarheid belangrijker dan de allerlaagste prijs. Een platform dat soms onverwacht duur wordt, is minder geschikt voor onderwijs.

Alle bedragen hieronder zijn indicatief en moeten voor aanschaf opnieuw gecontroleerd worden. Prijzen van cloud- en AI-platformen veranderen regelmatig.

### Belangrijkste kostenfactoren

| Kostenpost | Waar hangt het vanaf? | Beheersmaatregel |
|---|---|---|
| Frontend hosting | Aantal bezoekers, dataverkeer, builds | Static hosting/CDN gebruiken |
| Backend API | Aantal requests, server-runtime, piekmomenten | Caching, rate limits, simpele API's |
| Realtime verkeer | Aantal actieve gebruikers, aantal events, broadcast naar groepsleden | Events bundelen, alleen echte wijzigingen versturen |
| Database | Aantal mindmaps, bewaartermijn, snapshots, events | Expiry instellen, oude events opruimen |
| AI | Aantal analyses, tokens per analyse, gekozen model | Handmatige analyseknop, limieten per sessie |
| Afbeeldingen | Aantal zoekopdrachten, rate limits, caching | Resultaten cachen en gekozen afbeeldingen opslaan |
| Monitoring/logging | Hoeveel events en logs worden bewaard | Geen volledige leerlinginput loggen |
| Support/beheer | Aantal scholen, docenten, incidenten | Docentdashboard, duidelijke foutmeldingen |

### Aannames voor rekenvoorbeelden

Voor een realistische berekening gebruiken we deze aannames:

- 1 mindmap-sessie duurt gemiddeld 30 minuten.
- 1 groep bestaat gemiddeld uit 5 leerlingen.
- 1 leerling veroorzaakt gemiddeld elke 15 seconden een relevante wijziging.
- 1 mindmap heeft gemiddeld 60 tot 120 nodes.
- 1 sessie gebruikt gemiddeld 2 AI-analyses.
- 1 AI-analyse gebruikt ongeveer 1.500 inputtokens en 500 outputtokens.
- 1 groep zoekt gemiddeld 10 afbeeldingen.
- Een schoolmaand heeft ongeveer 20 actieve lesdagen.

Realtime events zijn duurder dan gewone opslag, omdat een actie naar meerdere gebruikers wordt doorgestuurd. Bij 5 deelnemers wordt 1 wijziging meestal naar 4 andere deelnemers verzonden. Sommige platformen tellen dit als meerdere realtime messages.

### Scenario 1: kleine pilot

Situatie:

- 1 school.
- 5 klassen.
- 150 leerlingen.
- 30 groepjes per maand.
- 5 leerlingen per groep.

Gebruik per maand:

```text
30 sessies x 5 leerlingen x 30 minuten x 4 wijzigingen per minuut
= 18.000 lokale wijzigingen

18.000 wijzigingen x 4 ontvangers
= ongeveer 72.000 realtime berichten

30 sessies x 2 AI-analyses
= 60 AI-analyses

30 sessies x 10 afbeeldingzoekacties
= 300 image searches
```

Kostenbeeld:

- Frontend: waarschijnlijk gratis of laag betaald.
- Backend/realtime: gratis of laagste betaalde laag is meestal genoeg.
- Database: zeer klein, waarschijnlijk onder 1 GB.
- AI: verwaarloosbaar als analyses beperkt blijven.
- Beheer: vooral ontwikkeltijd en docentondersteuning.

Advies:

Voor dit scenario is Supabase Realtime of een kleine eigen WebSocket-server voldoende. De belangrijkste onderzoeksvraag is nog niet kosten, maar betrouwbaarheid en gebruiksgemak.

### Scenario 2: meerdere scholen

Situatie:

- 10 scholen.
- 50 klassen.
- 1.500 leerlingen.
- 300 groepjes per maand.

Gebruik per maand:

```text
300 sessies x 5 leerlingen x 30 minuten x 4 wijzigingen per minuut
= 180.000 lokale wijzigingen

180.000 wijzigingen x 4 ontvangers
= ongeveer 720.000 realtime berichten

300 sessies x 2 AI-analyses
= 600 AI-analyses

300 sessies x 10 afbeeldingzoekacties
= 3.000 image searches
```

Kostenbeeld:

- Frontend: een Pro-plan of vergelijkbaar professioneel hostingpakket wordt logisch.
- Backend/realtime: nog steeds beheersbaar, maar quota moeten actief gemonitord worden.
- Database: enkele GB's per jaar, afhankelijk van bewaartermijn.
- AI: nog laag bij handmatige analyses, maar automatische AI zou hier al merkbaar duurder worden.
- Support: docentenbeheer, wachtwoorden, foutmeldingen en documentatie worden belangrijk.

Advies:

Gebruik multi-tenant inrichting vanaf dit niveau. Scholen moeten gescheiden kunnen worden in data, instellingen en rapportage. Voeg budgetlimieten toe per school of organisatie.

### Scenario 3: regionale of landelijke uitrol

Situatie:

- 50 scholen.
- 250 klassen.
- 7.500 leerlingen.
- 1.500 groepjes per maand.

Gebruik per maand:

```text
1.500 sessies x 5 leerlingen x 30 minuten x 4 wijzigingen per minuut
= 900.000 lokale wijzigingen

900.000 wijzigingen x 4 ontvangers
= ongeveer 3.600.000 realtime berichten

1.500 sessies x 2 AI-analyses
= 3.000 AI-analyses

1.500 sessies x 10 afbeeldingzoekacties
= 15.000 image searches
```

Kostenbeeld:

- Frontend en CDN blijven meestal goed schaalbaar.
- Realtime berichten en piekverbindingen worden de belangrijkste technische kostenpost.
- Databasekosten blijven beheersbaar als oude events worden opgeruimd.
- AI-kosten blijven voorspelbaar als er harde limieten per sessie zijn.
- Monitoring, logging, uptime en support worden belangrijker dan ruwe cloudkosten.

Advies:

Vanaf dit scenario is een professioneel productieplan nodig met monitoring, alerting, backups, dataverwerkingsovereenkomst en duidelijke SLA-afspraken. Het platform moet pieken aankunnen, bijvoorbeeld wanneer meerdere klassen tegelijk tijdens het tweede lesuur starten.

### AI-kosten in detail

AI is de kostenpost die het snelst uit de hand kan lopen als het automatisch wordt aangeroepen. Daarom moet AI bij MindFlow expliciet blijven: een gebruiker of docent klikt op `Vraag feedback`.

Rekenvoorbeeld op basis van 1 analyse:

```text
Input:  1.500 tokens
Output:   500 tokens
```

Bij een goedkoop model blijven de kosten per analyse meestal laag. Ter vergelijking: als een provider 0,75 dollar per 1 miljoen inputtokens en 4,50 dollar per 1 miljoen outputtokens rekent, kost 1 analyse ongeveer:

```text
1.500 / 1.000.000 x $0,75 = $0,001125
500 / 1.000.000 x $4,50 = $0,002250
Totaal per analyse = ongeveer $0,003375
```

Dat betekent:

| Aantal analyses per maand | Indicatiekosten bij goedkoop model |
|---:|---:|
| 600 | ongeveer $2 |
| 3.000 | ongeveer $10 |
| 30.000 | ongeveer $101 |

Bij een zwaarder model wordt het verschil groot. Als een provider 5 dollar per 1 miljoen inputtokens en 30 dollar per 1 miljoen outputtokens rekent, kost dezelfde analyse ongeveer:

```text
1.500 / 1.000.000 x $5,00 = $0,0075
500 / 1.000.000 x $30,00 = $0,0150
Totaal per analyse = ongeveer $0,0225
```

Dan wordt 30.000 analyses ongeveer 675 dollar per maand. Dit laat zien waarom modelkeuze en limieten belangrijk zijn.

Aanbevolen AI-limieten:

- Maximaal 3 tot 5 analyses per mindmap per uur.
- Maximaal aantal analyses per school per maand.
- Goedkoop standaardmodel voor gewone feedback.
- Zwaarder model alleen voor docentfuncties of evaluaties.
- Geen AI-call bij elke node-wijziging.
- Cache analyse niet blind, maar voorkom dubbele calls binnen korte tijd.

### Realtime kosten in detail

Realtime samenwerking bestaat uit kleine gebeurtenissen:

- node toegevoegd;
- node-label aangepast;
- node verplaatst;
- edge toegevoegd;
- node verwijderd;
- deelnemer online/offline;
- cursor of selectie gewijzigd.

Niet alle gebeurtenissen hoeven even vaak verzonden te worden. Vooral `node verplaatst` kan veel events veroorzaken tijdens slepen. Als elke muisbeweging wordt verstuurd, stijgen kosten en netwerkdruk snel.

Beheersmaatregelen:

- Verstuur node-posities maximaal 5 tot 10 keer per seconde tijdens slepen.
- Sla alleen definitieve positie op in de database.
- Verstuur tekstwijzigingen met debounce, bijvoorbeeld na 300 tot 500 ms.
- Verstuur presence minder vaak dan echte contentwijzigingen.
- Bundel meerdere kleine wijzigingen waar mogelijk.

Voor scholen is vooral piekbelasting belangrijk. Een school kan 800 leerlingen hebben, maar niet iedereen gebruikt MindFlow tegelijk. De infrastructuur moet daarom rekenen met gelijktijdige gebruikers:

| Situatie | Gelijktijdige gebruikers | Technische impact |
|---|---:|---|
| Kleine pilot | 10-30 | Gratis of lage tier waarschijnlijk genoeg |
| Enkele school | 30-150 | Let op realtime connection limits |
| Meerdere scholen | 150-750 | Monitoring en schaalplan nodig |
| Grote uitrol | 750+ | Professionele realtime architectuur nodig |

### Database en opslag

Mindmapdata is relatief klein. De database wordt vooral belast door:

- snapshots;
- event history;
- deelnemers;
- sessiegegevens;
- auditinformatie voor docenten.

Indicatie:

```text
1 snapshot met 100 nodes en edges: ongeveer 100 KB tot 500 KB
1 event: ongeveer 0,5 KB tot 2 KB
1 sessie met snapshot en events: vaak minder dan 1 MB
```

Bij 10.000 sessies per jaar is dat grofweg 10 GB opslag als alles bewaard blijft. Dit is technisch niet groot, maar privacy en beheer worden wel belangrijk.

Aanbevolen bewaartermijnen:

- Demo-sessies: automatisch verwijderen na 24 uur.
- Lesgroep-sessies: bewaren tot 30 of 90 dagen.
- Ingeleverde opdrachten: bewaren volgens schoolbeleid.
- Events: na 7 tot 30 dagen samenvoegen tot snapshot en oude events verwijderen.

### Hostingkeuze

Vercel is sterk voor frontend hosting en serverless API's. De Pro-laag start volgens Vercel bij 20 dollar per maand, met extra gebruikskosten boven inbegrepen quota. Voor langdurige WebSocket-verbindingen is Vercel niet de meest logische enige realtime-laag; combineer het dan met Supabase Realtime of een aparte realtime-server.

Render is geschikt voor een eigen Node.js backend met WebSockets. Render toont webservice-instances vanaf gratis, met Starter rond 7 dollar per maand en Standard rond 25 dollar per maand. Voor opschaling kunnen database, Redis/key-value en extra bandwidth erbij komen.

Supabase is praktisch als database plus realtime laag. Voor meerdere scholen is het voordeel dat database, realtime channels, row-level security en eventueel auth op een plek zitten. Het nadeel is platformafhankelijkheid en het bewaken van quota voor realtime messages, verbindingen en databasegrootte.

### Kostenbeheersing per school

Voor een SaaS-achtige uitrol is het verstandig om per school limieten in te stellen:

- maximaal aantal actieve mindmaps;
- maximaal aantal deelnemers per mindmap;
- maximaal aantal AI-analyses per maand;
- maximale bewaartermijn;
- maximaal aantal afbeeldingzoekacties;
- waarschuwing bij 80 procent van het maandbudget.

Dit maakt kosten voorspelbaar en voorkomt dat een fout, bot of enthousiaste klas het hele maandbudget verbruikt.

### Conclusie kosten

Voor MindFlow zullen realtime en databasekosten in de eerste schaalfases waarschijnlijk beheersbaar blijven. De grootste financiele risico's zitten in:

- automatische AI-calls;
- te vaak verzonden drag-events;
- onbeperkte bewaartermijn;
- veel support zonder docentdashboard;
- ontbreken van budgetlimieten per school.

Het advies is daarom: ontwerp niet alleen technisch schaalbaar, maar ook financieel begrensd. Zet limieten in het product zelf, niet alleen in de cloudomgeving.

## Privacy en veiligheid

Belangrijke risico's:

- Mindmapteksten kunnen persoonsgegevens of schoolinformatie bevatten.
- Minderjarigen gebruiken de app.
- Join-codes kunnen worden doorgestuurd.
- AI- en image-services ontvangen delen van leerlinginput.

Maatregelen:

- Gebruik korte tijdelijke sessies met vervaldatum.
- Maak join-codes niet te makkelijk te raden.
- Log geen volledige mindmapinhoud tenzij nodig voor debugging.
- Toon duidelijk dat AI-feedback externe verwerking kan gebruiken.
- Stuur alleen nodes en edges naar AI, geen overbodige metadata.
- Voeg rate limiting toe op joinen, code-generatie, AI-analyse en image search.
- Overweeg docentbeheer voordat de functie in echte klassen wordt gebruikt.

## Vergelijking van opties

| Optie | Voordelen | Nadelen | Advies |
|---|---|---|---|
| Supabase Realtime | Snel te bouwen, realtime plus database, presence mogelijk | Platformafhankelijk, quota en overage bewaken | Beste keuze voor pilot |
| Eigen WebSocket-server | Veel controle, sluit aan op huidige Node-backend | Meer onderhoud, schaalbaarheid zelf oplossen | Goed voor leerdoel of volledige controle |
| Yjs | Sterk bij gelijktijdig bewerken en offline support | Complexer om goed te modelleren | Interessant voor versie 2 |
| Liveblocks | Specifiek gemaakt voor collaborative apps | Extra externe dienst en mogelijk hogere kosten | Handig als snelheid belangrijker is dan eigen beheer |

## Aanbevolen roadmap

### Fase 1: Technische pilot

- Voeg join-code generatie toe.
- Maak tijdelijke rooms.
- Synchroniseer nodes en edges via Supabase Realtime of WebSocket.
- Sla periodiek een snapshot op.
- Test met 2 tot 5 gebruikers.

### Fase 2: Betrouwbaarheid

- Voeg reconnect-logica toe.
- Voeg aanwezigheid toe: online deelnemers en kleuren.
- Voeg rate limiting toe.
- Voeg foutmeldingen toe voor verlopen of onbekende codes.
- Test met 10 tot 25 gelijktijdige gebruikers.

### Fase 3: Onderwijscontext

- Voeg docentrol of read-only meekijken toe.
- Voeg sessie-expiry en simpele beheerpagina toe.
- Maak privacytekst begrijpelijk voor leerlingen en docenten.
- Onderzoek of accounts nodig zijn voor opgeslagen klassenwerk.

### Fase 4: Meerdere scholen

- Voeg organisaties/scholen toe als aparte tenants.
- Voeg docentaccounts toe.
- Laat leerlingen nog steeds zonder account joinen wanneer dat didactisch en privacytechnisch mag.
- Voeg schoolinstellingen toe voor bewaartermijn, AI-gebruik en maximale groepsgrootte.
- Voeg maandlimieten toe voor AI-analyses en afbeeldingzoekacties.
- Voeg rapportage toe per school: actieve sessies, aantal mindmaps, AI-verbruik en foutpercentages.

### Fase 5: Professionele uitrol

- Voeg monitoring, alerting en automatische backups toe.
- Stel een dataverwerkingsovereenkomst en privacydocumentatie op.
- Voeg auditlogs toe voor docent- en beheeracties.
- Test piekbelasting met honderden gelijktijdige gebruikers.
- Maak een supportproces voor scholen.
- Bepaal een prijsmodel per school, per leerling of per actief gebruik.

## Eindadvies

Voor MindFlow is realtime samenwerken technisch haalbaar, maar het moet niet meteen als volledige account- en cloudomgeving worden gebouwd. De beste aanpak is om te starten met tijdelijke join-codes, server-side snapshots en expliciete AI-analyse, en de architectuur vanaf het begin geschikt te maken voor meerdere scholen.

Kies voor Supabase Realtime als snelste en meest beheersbare route voor de eerste schaalbare versie. Het combineert realtime berichten, presence en opslag zonder dat er direct veel infrastructuur gebouwd hoeft te worden. Als later blijkt dat meerdere gebruikers vaak exact dezelfde node tegelijk bewerken, onderzoek dan Yjs als robuustere collaboration engine.

Voor opschaling naar meerdere scholen zijn drie keuzes cruciaal:

- Multi-tenant data-inrichting, zodat scholen logisch gescheiden blijven.
- Budgetlimieten per school, zodat AI en realtime verkeer voorspelbaar blijven.
- Docentbeheer, zodat sessies, bewaartermijnen en rechten niet alleen technisch maar ook organisatorisch kloppen.

De belangrijkste ontwerpkeuze is kostenbeheersing: synchroniseer mindmap-wijzigingen realtime, maar laat dure acties zoals AI-analyse en afbeelding zoeken alleen handmatig gebeuren.

## Open vragen

- Moeten mindmaps tijdelijk zijn, of moeten leerlingen ze weken later nog kunnen openen?
- Moet een docent eigenaar zijn van een sessie?
- Is anoniem samenwerken voldoende voor de eerste test?
- Hoeveel leerlingen moeten tegelijk in een mindmap kunnen werken?
- Mag leerlinginput worden verwerkt door externe AI-diensten binnen jullie schoolcontext?
- Moet er per school een eigen beheeromgeving komen?
- Willen scholen betalen per leerling, per docent, per klas of per actieve sessie?
- Welke bewaartermijn past bij schoolbeleid en AVG/GDPR-afspraken?

## Bronnen

- Supabase Realtime documentatie: https://supabase.com/docs/guides/realtime
- Supabase billing en realtime quota: https://supabase.com/docs/guides/platform/billing-on-supabase
- Yjs documentatie en eigenschappen: https://yjs.dev/
- Vercel pricing: https://vercel.com/pricing
- Render pricing: https://render.com/pricing
- Hugging Face pricing: https://huggingface.co/pricing
- OpenAI API pricing als referentie voor tokengebaseerde AI-kosten: https://openai.com/api/pricing/
