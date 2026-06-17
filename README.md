# MindFlow

MindFlow is een educatieve mindmap-app voor leerlingen van ongeveer 10 tot 15 jaar. Leerlingen kunnen ideeen visueel ordenen, nodes met elkaar verbinden, afbeeldingen toevoegen en korte coachende feedback krijgen van een AI Coach.

De app is bewust ontworpen als digitaal werkblad: rustig, direct bruikbaar en gericht op zelf nadenken. De AI vult de mindmap niet automatisch in, maar stelt vragen die leerlingen helpen om hun eigen structuur te verbeteren.

## Wat kun je ermee?

- Een mindmap maken vanaf een centraal hoofdonderwerp.
- Nodes toevoegen, bewerken, verplaatsen en verbinden.
- Visueel onderscheid zien tussen hoofdonderwerp, takken en details.
- Afbeeldingen zoeken bij nodes via Unsplash.
- AI-feedback krijgen op de structuur van de mindmap.
- Vervolgvragen gebruiken na een AI-analyse.
- De mindmap exporteren als PNG.

## Doelgroep

MindFlow is gemaakt voor:

- leerlingen van 10 tot 15 jaar;
- schoolopdrachten, presentaties, brainstorms en leeronderwerpen;
- docenten of begeleiders die leerlingen willen helpen structureren;
- educatieve projecten waarin AI ondersteunend moet zijn, niet overnemend.

## Productvisie

MindFlow moet voelen als een rustig digitaal werkblad. De leerling blijft eigenaar van de inhoud, terwijl de AI Coach helpt met vragen zoals:

- Welke tak is al duidelijk?
- Welke verbinding kan beter uitgelegd worden?
- Past dit idee logisch bij het hoofdonderwerp?

De kernbelofte:

> Maak een mindmap, zie je ideeen groeien en krijg kleine vragen die je helpen zelf betere verbanden te leggen.

## Tech stack

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

## Projectstructuur

```text
Mindmap/
- docs/
  - PRD.md
  - Kort-Advies-Keuzes.md
  - User-Testplan-10-15.md
  - Onderzoek-Realtime-Samenwerken-DOT.md
- src/
  - components/
  - ...
- server.js
- package.json
- README.md
```

Belangrijke documenten:

- [PRD](docs/PRD.md): productvisie, requirements, risico's en roadmap.
- [Kort advies keuzes](docs/Kort-Advies-Keuzes.md): onderbouwing van technische en productkeuzes.
- [User testplan](docs/User-Testplan-10-15.md): testaanpak voor de doelgroep.
- [Realtime samenwerking onderzoek](docs/Onderzoek-Realtime-Samenwerken-DOT.md): DOT-framework onderzoek naar samenwerken met join-codes en schaalbaarheid voor scholen.

## Installatie

Zorg dat Node.js is geinstalleerd. Installeer daarna de dependencies:

```bash
npm install
```

Maak een `.env` bestand aan in de root van het project:

```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
HF_API_KEY=your_huggingface_api_key
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
PORT=3000
```

`HF_MODEL` en `PORT` zijn optioneel. Zonder `HF_MODEL` gebruikt de backend standaard `Qwen/Qwen2.5-7B-Instruct`.

## Development

Start de backend:

```bash
npm run start-backend
```

Start in een tweede terminal de frontend:

```bash
npm run dev
```

De frontend draait standaard via Vite. De backend draait standaard op:

```text
http://localhost:3000
```

## Build

Maak een productiebuild:

```bash
npm run build
```

Preview de build lokaal:

```bash
npm run preview
```

## API-overzicht

### Afbeeldingen zoeken

```http
GET /api/images/search?topic=ocean
POST /api/images/search
```

De endpoint zoekt een afbeelding via Unsplash. Bij een POST-request kan extra context worden meegestuurd, zoals parent-, child- en root-labels. De backend kan Hugging Face gebruiken om betere Engelse zoekwoorden te maken voor Unsplash.

Voorbeeld response:

```json
{
  "imageUrl": "https://...",
  "searchQuery": "ocean fish",
  "searchLanguage": "en",
  "usedContext": true
}
```

### AI Coach

```http
POST /api/ai/guidance
```

Voorbeeld body:

```json
{
  "nodes": [],
  "edges": [],
  "selectedNodeId": "node-id-or-null"
}
```

De AI Coach geeft altijd een korte Nederlandse analyse met drie suggesties:

- `Wat gaat goed`
- `Kijk hier nog eens naar`
- `Past dit erbij`

De feedback is Socratisch: de AI stelt vragen en geeft kleine vervolgstappen, maar maakt de mindmap niet voor de leerling af.

## Huidige scope

De huidige versie richt zich op de persoonlijke mindmap-ervaring:

- canvas-interactie;
- node-creatie en bewerking;
- afbeelding zoeken;
- AI Coach;
- PNG-export.

Deze onderdelen vallen bewust buiten de huidige MVP:

- accounts en login;
- cloudopslag;
- docentdashboard;
- realtime samenwerken;
- automatische complete mindmap-generatie.

Realtime samenwerken is wel onderzocht als vervolgstap. Zie [Onderzoek-Realtime-Samenwerken-DOT.md](docs/Onderzoek-Realtime-Samenwerken-DOT.md).

## Privacy en veiligheid

MindFlow verwerkt leerlinginput via externe services wanneer bepaalde functies worden gebruikt:

- Mindmaplabels en edge-structuur kunnen naar Hugging Face worden gestuurd voor AI-feedback.
- Zoektermen kunnen naar Unsplash worden gestuurd voor afbeeldingen.

Aanbevolen uitgangspunten voor productie:

- stuur alleen noodzakelijke data naar externe services;
- log geen volledige leerlinginput;
- bewaar API keys alleen server-side;
- gebruik duidelijke privacy-informatie voor scholen, docenten en leerlingen;
- voeg rate limiting toe op AI- en image-endpoints.

## Roadmap

Korte termijn:

- Nederlandse UI-teksten verder aanscherpen.
- Lokale opslag toevoegen tegen werkverlies.
- Loading-, retry- en foutstates verbeteren.
- Export robuuster testen.

Middellange termijn:

- Templates voor schoolopdrachten.
- Undo/redo.
- Docentmodus of rubric-profielen.
- Betere mobiele toolbar.

Lange termijn:

- Mindmaps opslaan en later openen.
- Deelbare read-only links.
- Realtime samenwerken met join-codes.
- Schaalbare inrichting voor meerdere scholen en groepen.

## Status

MindFlow is een onderwijsgerichte MVP/demo. De kernfunctionaliteit is aanwezig, maar voor productiegebruik op meerdere scholen zijn extra stappen nodig rond privacy, opslag, rechten, monitoring en kostenbeheersing.
