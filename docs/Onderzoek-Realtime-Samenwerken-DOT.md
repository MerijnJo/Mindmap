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

## Kosteninschatting

De exacte bedragen veranderen per platform en gebruik. Voor een schoolproject of kleine pilot is dit een realistische denkrichting.

### Hosting frontend

Vercel of Render kan de frontend goedkoop of gratis hosten. Vercel heeft een gratis Hobby-laag en een Pro-laag vanaf 20 dollar per maand. Render biedt static sites vanaf 0 dollar per maand.

### Backend en realtime

Optie A: Supabase

- Gratis laag kan genoeg zijn voor een prototype.
- Supabase noemt onder andere 2 miljoen realtime messages en 200 peak realtime connections op Free.
- Pro heeft hogere quota, waaronder 5 miljoen realtime messages en 500 peak realtime connections.
- Boven quota betaal je extra, bijvoorbeeld per miljoen realtime messages of per extra piekverbinding.

Optie B: Render met eigen WebSocket-server

- Gratis of goedkope webservice voor prototype.
- Een betaalde starter webservice begint rond 7 dollar per maand.
- Databasekosten komen daar los bij als permanente opslag nodig is.

Optie C: Vercel serverless

- Goed voor frontend en gewone API-routes.
- Minder geschikt als enige oplossing voor langdurige WebSocket-verbindingen.
- Kan wel gecombineerd worden met Supabase Realtime of een externe realtime dienst.

### AI-kosten

De huidige app gebruikt Hugging Face via `HF_API_KEY`. Voor kostenbeheersing is het belangrijk dat AI alleen draait wanneer de gebruiker op analyse klikt.

Kosten worden meestal bepaald door:

- aantal analyses;
- lengte van de mindmap als input;
- lengte van het AI-antwoord;
- gekozen model;
- retries bij fouten.

Voorbeeld:

Als een analyse ongeveer 1.500 inputtokens en 500 outputtokens gebruikt, dan zijn 1.000 analyses ongeveer 1,5 miljoen inputtokens en 0,5 miljoen outputtokens. Bij een goedkoop tekstmodel blijft dit vaak laag, maar bij zwaardere modellen kan dit snel oplopen. Gebruik daarom een limiet per sessie, bijvoorbeeld maximaal 5 AI-analyses per mindmap per zoveel minuten.

### Afbeeldings-API

Unsplash blijft bruikbaar voor afbeeldingen, maar bij samenwerking kunnen meer gebruikers dezelfde afbeelding zoeken. Om kosten en rate limits te beperken:

- cache image-resultaten per node-label;
- sla gekozen image-url op in de mindmap;
- voorkom automatisch zoeken bij elke tekstwijziging;
- laat gebruikers expliciet klikken op afbeelding zoeken.

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

## Eindadvies

Voor MindFlow is realtime samenwerken technisch haalbaar, maar het moet niet meteen als volledige account- en cloudomgeving worden gebouwd. De beste aanpak is een beperkte pilot met tijdelijke join-codes, server-side snapshots en expliciete AI-analyse.

Kies voor Supabase Realtime als snelste en meest beheersbare route voor een schoolproject. Het combineert realtime berichten, presence en opslag zonder dat er direct veel infrastructuur gebouwd hoeft te worden. Als later blijkt dat meerdere gebruikers vaak exact dezelfde node tegelijk bewerken, onderzoek dan Yjs als robuustere collaboration engine.

De belangrijkste ontwerpkeuze is kostenbeheersing: synchroniseer mindmap-wijzigingen realtime, maar laat dure acties zoals AI-analyse en afbeelding zoeken alleen handmatig gebeuren.

## Open vragen

- Moeten mindmaps tijdelijk zijn, of moeten leerlingen ze weken later nog kunnen openen?
- Moet een docent eigenaar zijn van een sessie?
- Is anoniem samenwerken voldoende voor de eerste test?
- Hoeveel leerlingen moeten tegelijk in een mindmap kunnen werken?
- Mag leerlinginput worden verwerkt door externe AI-diensten binnen jullie schoolcontext?

## Bronnen

- Supabase Realtime documentatie: https://supabase.com/docs/guides/realtime
- Supabase billing en realtime quota: https://supabase.com/docs/guides/platform/billing-on-supabase
- Yjs documentatie en eigenschappen: https://yjs.dev/
- Vercel pricing: https://vercel.com/pricing
- Render pricing: https://render.com/pricing
- OpenAI API pricing als referentie voor tokengebaseerde AI-kosten: https://openai.com/api/pricing/
