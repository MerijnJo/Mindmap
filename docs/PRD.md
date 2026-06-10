# PRD: MindFlow

## 1. Samenvatting

MindFlow is een persoonlijke mindmap-app waarmee leerlingen ideeen visueel kunnen ordenen, uitbreiden met afbeeldingen en feedback krijgen van een AI Coach. De app richt zich op kinderen en jongeren van ongeveer 10 tot 15 jaar die een onderwerp willen verkennen zonder dat de AI het denkwerk voor hen overneemt.

Het product combineert een vrij canvas met simpele node-interacties, visuele ondersteuning via Unsplash en coachende AI-feedback op de structuur van de mindmap.

## 2. Probleem

Leerlingen weten vaak wel iets over een onderwerp, maar vinden het lastig om losse ideeen logisch te structureren. Traditionele mindmap-tools helpen bij tekenen, maar geven geen inhoudelijke reflectie op de opbouw. AI-chattools kunnen snel te veel invullen, waardoor de leerling minder zelf nadenkt.

MindFlow moet leerlingen helpen om:

- een hoofdonderwerp op te splitsen in duidelijke takken;
- verbanden tussen ideeen zichtbaar te maken;
- te ontdekken welke onderdelen nog onduidelijk zijn;
- visuele inspiratie toe te voegen;
- zelf eigenaar te blijven van de inhoud.

## 3. Doelgroep

Primaire doelgroep:

- Leerlingen van 10 tot 15 jaar.
- Gebruikers die een schoolopdracht, presentatie, brainstorm of leeronderwerp voorbereiden.
- Leerlingen die baat hebben bij visueel denken en korte, concrete feedback.

Secundaire doelgroep:

- Docenten, ouders of begeleiders die leerlingen willen helpen nadenken over structuur.
- Makers van educatieve tools die MindFlow willen uitbreiden of integreren.

## 4. Productvisie

MindFlow moet voelen als een rustig digitaal werkblad: direct bruikbaar, visueel helder en uitnodigend om mee te spelen. De AI Coach is geen antwoordmachine, maar een begeleider die vragen stelt zoals een goede docent dat zou doen.

De kernbelofte:

> Maak een mindmap, zie je ideeen groeien en krijg kleine vragen die je helpen zelf betere verbanden te leggen.

## 5. Huidige Productstatus

De huidige codebase bevat een werkende Vite/React-app met:

- React Flow canvas voor nodes en edges.
- Een vaste root node met label `Main Topic`.
- Custom mindmap nodes met invoerveld.
- Child-node creatie via plusknop.
- Drag-interactie voor niet-root nodes.
- Verbindingen tussen nodes.
- Node-niveaus met visuele stijlen voor root, child en detail nodes.
- Afbeelding zoeken per node via lokale backend en Unsplash API.
- Afbeelding opnieuw genereren voor bestaande image nodes.
- AI Coach drawer met analyseknop.
- AI-guidance backend via Hugging Face chat completions.
- Drie vaste follow-up prompts.
- PNG-export van de mindmap.

## 6. Goals

### Productdoelen

- Leerlingen kunnen binnen 30 seconden starten met een mindmap.
- Gebruikers kunnen zonder uitleg nodes toevoegen, bewerken, verplaatsen en verbinden.
- De AI Coach geeft concrete, vriendelijke feedback die leidt tot een bewerking in de mindmap.
- De app ondersteunt visueel denken door afbeeldingen aan nodes toe te voegen.
- Gebruikers kunnen hun resultaat exporteren als PNG.

### Leerdoelen

- De leerling begrijpt beter welke ideeen hoofdonderwerp, subonderwerp of voorbeeld zijn.
- De leerling kan minstens een onduidelijke verbinding verbeteren na AI-feedback.
- De leerling blijft zelf beslissen welke inhoud wordt toegevoegd of aangepast.

## 7. Non-Goals

Voor de huidige fase vallen deze zaken buiten scope:

- Volledige accountregistratie of login.
- Realtime samenwerking met meerdere gebruikers.
- Cloudopslag van mindmaps.
- Docentendashboard.
- Automatisch invullen van complete mindmaps door AI.
- Feitelijke beoordeling van de inhoud als waarheid of onwaarheid.
- Complexe templates, rubrics of lesmethodes.

## 8. Kernfunctionaliteit

### 8.1 Mindmap Canvas

Gebruikers moeten een mindmap kunnen bouwen op een oneindig of ruim canvas.

Requirements:

- De app opent met een centrale root node.
- De root node is het hoofdonderwerp.
- Gebruikers kunnen het label van elke node direct aanpassen.
- Gebruikers kunnen child nodes toevoegen vanaf elke bestaande node.
- Nieuwe child nodes worden automatisch verbonden met hun parent.
- Niet-root nodes zijn verplaatsbaar.
- Nodes kunnen geselecteerd worden.
- Nodes en edges kunnen verwijderd worden via `Backspace` of `Delete`.
- Canvas heeft zoom- en pan-controls.

Acceptance criteria:

- Een nieuwe gebruiker kan zonder modal of onboarding een hoofdonderwerp typen.
- Na klikken op `+` verschijnt een child node met een edge naar de parent.
- Een geselecteerde node wordt visueel herkenbaar gemarkeerd.

### 8.2 Node Visuals

Nodes moeten visueel duidelijk maken waar ze in de structuur zitten.

Requirements:

- Root node heeft een onderscheidende stijl.
- Eerste niveau child nodes hebben een eigen stijl.
- Diepere detail nodes hebben een eigen stijl.
- Nodes zonder afbeelding tonen label en image-knop.
- Nodes met afbeelding tonen label, afbeelding en regenerate-knop.
- Node-labels blijven bewerkbaar na toevoegen van een afbeelding.

Acceptance criteria:

- Gebruikers kunnen in een oogopslag root, child en detail nodes onderscheiden.
- Een node met afbeelding blijft compact en bruikbaar.

### 8.3 Afbeeldingen

Gebruikers kunnen een afbeelding zoeken op basis van het node-label.

Requirements:

- Klik op image-knop haalt een afbeelding op via `/api/images/search`.
- Backend gebruikt `UNSPLASH_ACCESS_KEY`.
- Bij ontbrekend label krijgt gebruiker een melding.
- Bij ontbrekende API key krijgt backend een duidelijke foutmelding.
- Bij geen resultaat toont de UI een begrijpelijke fout.
- Gebruiker kan een afbeelding opnieuw ophalen.

Acceptance criteria:

- Voor een geldig onderwerp verschijnt een afbeelding in de node.
- Fouten maken duidelijk of backend/API-configuratie ontbreekt.

### 8.4 AI Coach

De AI Coach analyseert de mindmap en geeft Socratische feedback.

Requirements:

- Gebruiker kan de AI Coach openen en sluiten.
- Coach toont aantal nodes of geselecteerde focus-node.
- `Analyze Mind Map` stuurt nodes, edges en selectedNodeId naar `/api/ai/guidance`.
- Backend gebruikt `HF_API_KEY` en optioneel `HF_MODEL`.
- AI geeft altijd een overzicht en precies drie suggesties:
  - `What is good`
  - `Needs another look`
  - `Check if it fits`
- Feedback is kort, vriendelijk en geschikt voor 10-15 jaar.
- AI geeft geen kant-en-klare antwoorden of volledige inhoud.
- Feedbackvragen moeten beantwoordbaar zijn door de mindmap te bewerken.
- Bij AI-fout toont de UI een duidelijke foutmelding.

Acceptance criteria:

- Een mindmap met minimaal een root node kan geanalyseerd worden.
- De coach geeft concrete feedback op structuur, verbindingen of plaatsing.
- De coach verwijst naar een geselecteerde node wanneer die relevant is.
- Een mislukte AI-call blokkeert het canvas niet.

### 8.5 Follow-Up Prompts

Gebruikers kunnen na analyse snelle vervolgvragen stellen.

Requirements:

- Beschikbare prompts:
  - `What should I add next?`
  - `How do these ideas connect?`
  - `What should I explain better?`
- Follow-up antwoorden gebruiken de bestaande guidance.
- Follow-ups vereisen geen nieuwe API-call in de huidige implementatie.

Acceptance criteria:

- Na een analyse kan de gebruiker op een follow-up klikken.
- Coach toont zowel de gekozen vraag als een passend antwoord.

### 8.6 Export

Gebruikers kunnen hun mindmap als PNG downloaden.

Requirements:

- `Export PNG` exporteert de zichtbare mindmap op basis van node-bounds.
- Export gebruikt witte achtergrond.
- UI-controls, drag handles en node-knoppen worden verborgen tijdens export.
- Bestandsnaam wordt afgeleid van het root-label.
- Export heeft minimale afmetingen voor bruikbaar resultaat.

Acceptance criteria:

- Een mindmap kan worden gedownload als PNG.
- De export bevat nodes, edges en afbeeldingen.
- De export bevat geen interactieve UI-knoppen.

## 9. UX-Principes

- Eerste scherm is de werkruimte, geen marketingpagina.
- UI moet rustig en taakgericht blijven.
- Teksten zijn kort en begrijpelijk.
- De AI Coach helpt door vragen te stellen, niet door werk over te nemen.
- Foutmeldingen moeten actiegericht zijn.
- Visuele elementen ondersteunen begrip, niet decoratie.
- Leerlingen moeten kunnen experimenteren zonder bang te zijn iets fout te doen.

## 10. Technische Architectuur

Frontend:

- Vite
- React
- React Flow via `@xyflow/react`
- Tailwind CSS
- `html-to-image` voor PNG-export

Backend:

- Node.js
- Express
- Native `fetch`
- `dotenv`

Externe services:

- Unsplash API voor afbeeldingen.
- Hugging Face router chat completions voor AI-guidance.

Belangrijke environment variables:

- `UNSPLASH_ACCESS_KEY`
- `HF_API_KEY`
- `HF_MODEL` optioneel, default `Qwen/Qwen2.5-7B-Instruct`
- `PORT` optioneel, default `3000`

## 11. API-Contracten

### GET `/api/images/search`

Query:

- `topic`: verplicht, string.

Response success:

```json
{
  "imageUrl": "https://..."
}
```

Fouten:

- `400` als topic ontbreekt.
- `500` als `UNSPLASH_ACCESS_KEY` ontbreekt.
- `404` als geen afbeelding gevonden wordt.
- Upstream status bij Unsplash-fout.

### POST `/api/ai/guidance`

Body:

```json
{
  "nodes": [],
  "edges": [],
  "selectedNodeId": "node-id-or-null"
}
```

Response success:

```json
{
  "overview": "string",
  "focusNodeId": "string-or-null",
  "suggestions": [
    {
      "nodeId": "string-or-null",
      "type": "next-step",
      "title": "What is good",
      "message": "string",
      "question": "string"
    }
  ]
}
```

Fouten:

- `400` als er geen nodes zijn.
- `500` als `HF_API_KEY` ontbreekt.
- `502` als Hugging Face geen bruikbaar antwoord teruggeeft.
- `504` bij timeout.
- Upstream status bij Hugging Face-fout.

## 12. Metrics

Productmetrics:

- Aantal aangemaakte nodes per sessie.
- Percentage sessies met minimaal een child node.
- Percentage sessies waarin AI Coach gebruikt wordt.
- Percentage AI-analyses dat succesvol antwoord geeft.
- Percentage sessies met image search.
- Percentage sessies met PNG-export.

Kwalitatieve signalen:

- Leerlingen begrijpen wat ze na AI-feedback kunnen doen.
- Docenten vinden de feedback passend en niet te sturend.
- Gebruikers ervaren de app als snel genoeg.

## 13. Risico's

- AI kan alsnog te generiek of te sturend reageren.
- AI-output kan ongeldig JSON bevatten, ondanks parsing fallback.
- Unsplash-resultaten kunnen ongeschikt, irrelevant of inconsistent zijn.
- Zonder opslag verliest de gebruiker werk bij refresh.
- Root node is momenteel niet draggable, wat gewenst kan zijn maar ook beperkend kan voelen.
- Handmatige edge-creatie kan verwarring geven als gebruikers ongewenste verbindingen maken.
- API keys in lokale `.env` maken setup gevoelig voor configuratiefouten.

## 14. Privacy en Veiligheid

Huidige uitgangspunten:

- Mindmapdata wordt voor AI-analyse naar de backend gestuurd.
- Backend stuurt mindmaplabels en edge-structuur door naar Hugging Face.
- Afbeeldingszoekopdrachten worden naar Unsplash gestuurd.
- Er is geen account- of opslaglaag in de huidige scope.

Aanbevelingen:

- Maak in de UI of documentatie duidelijk dat externe AI/image-services worden gebruikt.
- Stuur alleen noodzakelijke node-data naar AI-services.
- Log geen volledige leerlinginput in productie.
- Vermijd API-key details in client-side code.

## 15. MVP Scope

De MVP is gereed wanneer gebruikers:

- een mindmap kunnen maken vanaf een root topic;
- child nodes kunnen toevoegen, bewerken, verplaatsen en verwijderen;
- afbeeldingen kunnen toevoegen aan nodes;
- AI-feedback kunnen krijgen op de structuur van de mindmap;
- follow-up prompts kunnen gebruiken;
- de mindmap als PNG kunnen exporteren;
- duidelijke foutmeldingen krijgen bij ontbrekende backend/API-configuratie.

## 16. Roadmap

### Fase 1: Stabiliseren

- Voeg projectdocumentatie toe voor setup en `.env`.
- Voeg basisfoutstates toe die minder afhankelijk zijn van `alert`.
- Voeg loading en retry states toe voor AI en image search.
- Test export met nodes buiten de initiele viewport.
- Verwijder of implementeer ongebruikte bestanden zoals `CustomNode.jsx`.

### Fase 2: Gebruiksgemak

- Voeg lokale opslag toe zodat werk niet verloren gaat bij refresh.
- Voeg undo/redo toe.
- Voeg eenvoudige templates toe voor schoolopdrachten.
- Voeg node-contextmenu toe voor verwijderen, dupliceren en kleur/level aanpassen.
- Voeg betere mobiele toolbar toe.

### Fase 3: Educatieve Waarde

- Maak AI-feedback taalinstelbaar, bijvoorbeeld Nederlands/Engels.
- Voeg docentmodus of rubric-profielen toe.
- Laat AI specifieke node highlighten op basis van `focusNodeId`.
- Voeg reflectiestap toe na export: "Wat heb je verbeterd?"

### Fase 4: Delen en Samenwerken

- Mindmaps opslaan en later openen.
- Export naar PDF.
- Deelbare read-only link.
- Optionele realtime samenwerking.

## 17. Open Vragen

- Moet de primaire taal van de app Nederlands, Engels of tweetalig zijn?
- Is de doelgroep specifiek schoolcontext, thuisgebruik of beide?
- Moet AI-feedback volledig lokaal configureerbaar zijn door docenten?
- Moeten afbeeldingen automatisch gefilterd of gecureerd worden voor jonge gebruikers?
- Is opslag gewenst in localStorage, database of export/import-bestanden?
- Moet de root node bewust vast blijven staan?

## 18. Definition of Done

Een feature is klaar wanneer:

- de gebruikerstaak end-to-end werkt;
- fout- en loadingstates zijn afgehandeld;
- de feature bruikbaar is op desktop en redelijke mobiele breedtes;
- gevoelige configuratie niet naar de client lekt;
- AI-gedrag past bij de coachende productvisie;
- bestaande canvas-, image-, AI- en exportflows niet regressief breken.
