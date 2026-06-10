# Stakeholderadvies: MindFlow

## 1. Korte conclusie

MindFlow heeft een sterke basis als educatieve mindmap-tool voor leerlingen van 10 tot 15 jaar. De combinatie van een visueel canvas, afbeeldingen en een coachende AI sluit goed aan bij leerlingen die moeite hebben om losse ideeen te ordenen.

Het belangrijkste advies is om MindFlow niet te positioneren als een AI-tool die antwoorden geeft, maar als een denk- en structuurtool. De AI Coach moet leerlingen helpen betere keuzes te maken in hun mindmap, zonder het werk over te nemen.

Voor een volgende fase is het verstandig om eerst te focussen op begrijpelijkheid, taal, opslag en betrouwbaarheid voordat er grotere functies zoals accounts, samenwerking of docentdashboards worden toegevoegd.

## 2. Productwaarde

MindFlow lost een herkenbaar probleem op: leerlingen kunnen vaak wel ideeen bedenken, maar vinden het lastig om die ideeen logisch te ordenen. Een gewone mindmap-tool helpt met tekenen, maar geeft geen inhoudelijke begeleiding. Een gewone AI-chat kan juist te snel antwoorden geven.

MindFlow zit tussen die twee in:

- De leerling maakt zelf de mindmap.
- De AI kijkt mee als coach.
- Afbeeldingen helpen om onderwerpen visueel te maken.
- Export maakt het resultaat bruikbaar voor schoolopdrachten.

De waarde voor stakeholders zit vooral in:

- zelfstandiger leren;
- visueel denken;
- lagere drempel om met een opdracht te starten;
- AI-gebruik dat niet draait om kopieren, maar om reflecteren;
- mogelijke inzet in schoolcontext, huiswerk of projectonderwijs.

## 3. Belangrijkste doelgroep

De primaire doelgroep blijft leerlingen van 10 tot 15 jaar. Binnen deze groep zijn er duidelijke verschillen:

| Leeftijd | Verwachting | Productimplicatie |
| --- | --- | --- |
| 10-11 | Heeft meer behoefte aan duidelijke taal en zichtbare knoppen | Vermijd moeilijke termen zoals `Export`, `PNG`, `Analyze` |
| 12-13 | Waarschijnlijk kerngebruiker voor schoolopdrachten | Focus op snelle start, duidelijke feedback en simpele structuur |
| 14-15 | Verwacht meer controle en minder kinderachtige toon | Houd UI rustig, serieus en niet te speels |

Advies: ontwerp primair voor 12-13 jaar, maar test expliciet of 10-11 jarigen de taal begrijpen en of 14-15 jarigen het product serieus genoeg vinden.

## 4. Huidige sterktes

| Sterkte | Waarom belangrijk |
| --- | --- |
| Direct canvas bij openen | Leerlingen kunnen meteen starten zonder onboarding |
| Simpele node-creatie | Past goed bij brainstormen en mindmaps maken |
| Visueel onderscheid tussen levels | Helpt structuur zichtbaar maken |
| Afbeeldingen per node | Ondersteunt visuele denkers en maakt de mindmap aantrekkelijker |
| AI Coach met Socratische insteek | Voorkomt dat AI de opdracht volledig overneemt |
| PNG-export | Maakt het resultaat bruikbaar buiten de app |
| Geen accounts nodig in MVP | Lage drempel voor testen en schoolcontext |

## 5. Belangrijkste risico's

| Risico | Impact | Advies |
| --- | --- | --- |
| Engelse UI-termen zijn niet begrijpelijk voor alle leerlingen | Hoog | Maak de UI Nederlands of voeg taalkeuze toe |
| AI-feedback is te vaag of te abstract | Hoog | Test feedback met doelgroep en koppel advies sterker aan concrete nodes |
| Leerlingen verwachten dat AI de mindmap automatisch maakt | Middel-Hoog | Positioneer AI als coach, niet als generator |
| Werk gaat verloren bij refresh | Hoog | Voeg lokale opslag toe voor MVP-stabiliteit |
| Delete/verwijderen is niet zichtbaar | Middel | Voeg zichtbare verwijderactie toe |
| Afbeeldingen kunnen irrelevant zijn | Middel | Laat gebruiker opnieuw zoeken of kies uit meerdere opties |
| Export PNG wordt niet begrepen | Middel | Hernoem naar `Download afbeelding` |

## 6. MVP-advies

De huidige MVP-richting is goed, maar moet scherper worden afgebakend.

### Behouden in MVP

- Mindmap canvas met root node.
- Nodes toevoegen, bewerken en verplaatsen.
- Visuele node-levels.
- Afbeelding toevoegen aan nodes.
- AI Coach analyse.
- PNG-export.

### Toevoegen voor een sterke MVP

- Nederlandse UI-teksten.
- Lokale opslag via browser.
- Zichtbare verwijderknop of contextactie.
- Betere foutmeldingen zonder technische tekst.
- Duidelijkere labels:
  - `Analyze Mind Map` naar `Laat AI Coach meekijken`
  - `Export PNG` naar `Download afbeelding`
  - `Main Topic` naar `Hoofdonderwerp`
  - `Enter idea...` naar `Typ je idee...`

### Niet toevoegen voor MVP

- Accounts.
- Realtime samenwerking.
- Docentendashboard.
- Cloudopslag.
- Complexe templates.
- AI die automatisch complete mindmaps maakt.

Deze functies kunnen later waardevol zijn, maar verhogen nu de complexiteit en leiden af van de kernvraag: begrijpen leerlingen de tool en helpt de AI-feedback echt?

## 7. Advies over AI

De AI Coach is de meest onderscheidende functie, maar ook het grootste productrisico.

Advies:

- Houd de AI Socratisch en coachend.
- Laat AI geen complete antwoorden of kant-en-klare mindmaps geven.
- Laat AI maximaal 3 concrete tips geven.
- Gebruik eenvoudige taal voor 10-15 jaar.
- Laat AI feedback koppelen aan specifieke nodes.
- Test of leerlingen de feedback kunnen navertellen.
- Test of leerlingen na feedback daadwerkelijk iets aanpassen.

De belangrijkste succesvraag is niet:

> Geeft de AI een slim antwoord?

Maar:

> Kan een leerling door dit antwoord zelf een betere mindmap maken?

## 8. Advies over taal en UX

Voor deze doelgroep is taal geen detail, maar een kernonderdeel van bruikbaarheid. De huidige app bevat meerdere Engelse termen die waarschijnlijk frictie geven.

Aanbevolen taalrichting:

| Huidige term | Aanbevolen term |
| --- | --- |
| `Main Topic` | `Hoofdonderwerp` |
| `Enter idea...` | `Typ je idee...` |
| `AI Coach` | `AI Coach` of `Denkhulp` |
| `Analyze Mind Map` | `Laat AI meekijken` |
| `Export PNG` | `Download afbeelding` |
| `Regenerate image` | `Nieuwe afbeelding zoeken` |
| `What should I add next?` | `Wat kan ik nog toevoegen?` |
| `How do these ideas connect?` | `Hoe horen deze ideeen bij elkaar?` |
| `What should I explain better?` | `Wat kan duidelijker?` |

Advies: test eerst volledig Nederlandse UI-teksten. Als Engels belangrijk blijft voor het project, maak taalkeuze onderdeel van een latere fase.

## 9. Validatieadvies

Voer eerst een kleine usability test uit met 6 leerlingen:

- 2 leerlingen van 10-11 jaar.
- 2 leerlingen van 12-13 jaar.
- 2 leerlingen van 14-15 jaar.

Gebruik de testmatrix in [User-Testplan-10-15.md](./User-Testplan-10-15.md).

Belangrijkste vragen voor deze test:

- Begrijpen leerlingen waar ze moeten beginnen?
- Vinden ze de plusknop?
- Begrijpen ze de AI-feedback?
- Kunnen ze na AI-feedback een verbetering maken?
- Begrijpen ze termen zoals export, PNG en analyse?
- Zien ze schoolwaarde in het product?

Beslis na deze test pas over grotere investeringen.

## 10. Aanbevolen Roadmap

### Fase 1: Begrijpelijkheid en stabiliteit

Doel: leerlingen kunnen de app zelfstandig gebruiken.

Aanbevolen acties:

- UI-teksten Nederlands maken.
- Lokale opslag toevoegen.
- Verwijderen zichtbaarder maken.
- Foutmeldingen herschrijven voor kinderen.
- AI-feedback testen en aanscherpen.

### Fase 2: Educatieve waarde

Doel: AI Coach aantoonbaar nuttig maken voor leren.

Aanbevolen acties:

- AI-feedback aan specifieke nodes koppelen.
- `focusNodeId` visueel highlighten.
- Reflectievraag toevoegen na AI-feedback.
- Eenvoudige schooltemplates testen.

### Fase 3: Delen en vervolggebruik

Doel: MindFlow bruikbaar maken in echte schoolcontext.

Aanbevolen acties:

- Export naar PDF.
- Mindmap opslaan/openen.
- Deelbare link.
- Optioneel docentoverzicht.

## 11. Beslissingen voor Stakeholders

| Beslissing | Advies | Moment |
| --- | --- | --- |
| Primaire taal | Nederlands voor MVP | Voor volgende test |
| AI-positionering | Coach, geen generator | Nu vastleggen |
| Opslag | LocalStorage in MVP | Voor pilot |
| Accounts | Niet in MVP | Na validatie |
| Doelcontext | Schoolopdrachten en brainstorms | Nu aanscherpen |
| Succesmeting | Begrip + actie na AI-feedback | Voor user tests |

## 12. Succescriteria voor Pilot

Een eerste pilot is succesvol als:

- 80% van leerlingen zelfstandig start met een hoofdonderwerp.
- 80% minimaal 3 nodes kan toevoegen.
- 70% begrijpt wat de AI Coach adviseert.
- 60% na AI-feedback een zinvolle wijziging maakt.
- 70% de mindmap kan downloaden.
- De meeste leerlingen noemen een concrete schooltoepassing.

## 13. Eindadvies

Ga door met MindFlow als educatieve MVP, maar maak de volgende stap klein en scherp: test eerst of de doelgroep de kernflow begrijpt.

De grootste kans ligt niet in meer functies, maar in betere begeleiding:

- duidelijkere taal;
- betrouwbaardere basisinteracties;
- AI-feedback die leerlingen echt kunnen omzetten in actie;
- behoud van eigenaarschap bij de leerling.

Als deze basis werkt bij 10-15 jarigen, is MindFlow een sterke kandidaat voor verdere ontwikkeling richting schoolgebruik, templates, opslag en later eventueel docentfunctionaliteit.
