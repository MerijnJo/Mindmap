# Kort Advies: Keuzes voor MindFlow

## Mindmap Canvas

Onze huidige keuze: We hebben gekozen voor React Flow als basis voor het mindmap-canvas. Hiermee kunnen leerlingen vakjes toevoegen, verplaatsen en verbinden zonder dat we zelf een volledig canvas-systeem hoeven te bouwen.

Waarom we hiervoor hebben gekozen:

- Snel en betrouwbaar: React Flow is gemaakt voor nodes, lijnen en interactieve canvas-apps. Daardoor konden we snel een werkende mindmap bouwen.
- Minder technische risico's: Slepen, selecteren, zoomen en verbinden zijn moeilijke onderdelen om zelf goed te maken. React Flow lost veel hiervan al op.
- Geschikt voor uitbreiding: Later kunnen we makkelijker functies toevoegen zoals templates, opslaan, highlighten van AI-feedback of extra node-types.

Het "betere" alternatief (en waarom we dat niet deden):

Optie: Een volledig eigen canvas bouwen met HTML Canvas of SVG.

Waarom niet gekozen:

- Te veel ontwikkeltijd: Alle interacties, zoals slepen, zoomen, selecteren en lijnen tekenen, moeten dan zelf gebouwd en getest worden.
- Meer kans op bugs: Vooral bij jonge gebruikers moet de basis heel soepel werken. Een eigen canvas maakt de kans op frustratie groter.
- Minder focus op het leerdoel: De waarde van MindFlow zit niet in een technisch uniek canvas, maar in leerlingen helpen hun ideeen te structureren.

## AI Coach

Onze huidige keuze: We hebben gekozen voor een AI Coach die de bestaande mindmap analyseert en korte, coachende feedback geeft. De AI krijgt de nodes en verbindingen als tekst/JSON en geeft precies drie suggesties terug.

Waarom we hiervoor hebben gekozen:

- Leerling blijft eigenaar: De AI maakt de mindmap niet zelf af, maar stelt vragen waardoor de leerling zelf moet nadenken.
- Lage technische complexiteit: We sturen alleen labels en verbindingen naar de server, geen screenshots of zware bestanden.
- Passend bij onderwijs: De AI helpt met structuur en reflectie, niet met het kant-en-klaar geven van antwoorden.

Het "betere" alternatief (en waarom we dat niet deden):

Optie: Een AI die automatisch complete mindmaps genereert, inclusief hoofdonderwerpen, subonderwerpen en voorbeelden.

Waarom niet gekozen:

- Te passief voor leerlingen: Als de AI de mindmap maakt, hoeft de leerling vooral te accepteren in plaats van zelf te denken.
- Minder leerwaarde: Het doel is dat leerlingen verbanden leren leggen. Dat gebeurt minder als de structuur al voor hen wordt gemaakt.
- Risico op verkeerde inhoud: Een automatisch gegenereerde mindmap kan feitelijke fouten of onlogische verbanden bevatten.

## Afbeeldingen bij Nodes

Onze huidige keuze: We hebben gekozen voor afbeeldingen via Unsplash op basis van het node-label. Een leerling typt een idee en kan daar een passende afbeelding bij zoeken.

Waarom we hiervoor hebben gekozen:

- Visuele ondersteuning: Afbeeldingen helpen leerlingen om ideeen sneller te herkennen en te onthouden.
- Snelle implementatie: Unsplash heeft een duidelijke API en levert direct bruikbare afbeeldingen.
- Geen zware AI-generatie nodig: We hoeven geen afbeeldingen te genereren, alleen bestaande beelden op te halen.

Het "betere" alternatief (en waarom we dat niet deden):

Optie: AI-afbeeldingen genereren per node, bijvoorbeeld met een image generation model.

Waarom niet gekozen:

- Duurder en trager: AI-afbeeldingen genereren kost meer tijd en API-budget dan een bestaande afbeelding zoeken.
- Meer veiligheidscontrole nodig: Bij een doelgroep van 10-15 jaar moet gegenereerde beeldinhoud extra goed gecontroleerd worden.
- Niet nodig voor de MVP: Het doel is visuele ondersteuning, niet het maken van unieke kunstwerken.

## Exporteren

Onze huidige keuze: We hebben gekozen voor PNG-export van de mindmap. De gebruiker kan de mindmap downloaden als afbeelding.

Waarom we hiervoor hebben gekozen:

- Direct bruikbaar: Een PNG kan makkelijk in een presentatie, verslag of schoolopdracht worden gezet.
- Simpel voor MVP: Een afbeelding exporteren is technisch eenvoudiger dan volledige documentexport.
- Geen account nodig: De leerling kan het resultaat bewaren zonder login of cloudopslag.

Het "betere" alternatief (en waarom we dat niet deden):

Optie: Export naar PDF, PowerPoint of een deelbare online link.

Waarom niet gekozen:

- Meer complexiteit: PDF en PowerPoint vragen extra layout-logica en foutafhandeling.
- Deelbare links vereisen opslag: Daarvoor is een database, hostingstructuur en privacybeleid nodig.
- Eerst kernflow valideren: Voor de eerste versie is het belangrijker dat leerlingen de mindmap kunnen maken en begrijpen.

## Opslag

Onze huidige keuze: In de huidige versie is er nog geen permanente opslag. De focus ligt eerst op het bouwen en testen van de kernervaring.

Waarom we hiervoor hebben gekozen:

- Sneller testen: Zonder accounts en database kunnen we sneller met leerlingen valideren of de tool begrijpelijk is.
- Minder privacyrisico: Er worden nog geen mindmaps langdurig opgeslagen.
- Lagere technische drempel: De MVP blijft klein en overzichtelijk.

Het "betere" alternatief (en waarom we dat nog niet deden):

Optie: Accounts met cloudopslag, zodat leerlingen hun mindmaps later kunnen openen.

Waarom niet gekozen:

- Privacy en toestemming: Bij minderjarigen vraagt opslag van werk en accounts om extra zorg.
- Meer ontwikkelwerk: Login, database, beveiliging en beheer maken het project veel groter.
- Nog niet bewezen nodig: Eerst moet blijken of leerlingen de tool zelf waardevol vinden.

Advies: voeg als eerste tussenstap lokale opslag toe in de browser. Dat voorkomt werkverlies zonder meteen accounts of cloudopslag te bouwen.

## Taal en Doelgroep

Onze huidige keuze: De app bevat nu nog meerdere Engelse termen, zoals `Main Topic`, `Analyze Mind Map` en `Export PNG`. Voor de volgende versie adviseren we om de interface Nederlands te maken.

Waarom we hiervoor kiezen:

- Begrijpelijker voor 10-15 jaar: Termen als `export`, `PNG` en `analyze` kunnen onnodige verwarring geven.
- Minder uitleg nodig: Als knoppen direct duidelijk zijn, kunnen leerlingen zelfstandiger werken.
- Betere aansluiting op schoolcontext: Een Nederlandse interface past beter bij Nederlandse leerlingen en docenten.

Het alternatief (en waarom we dat niet als eerste kiezen):

Optie: De interface Engels houden of meteen tweetalig maken.

Waarom niet gekozen:

- Engels kan testresultaten vervuilen: Als leerlingen vastlopen op taal, weten we minder goed of de interactie zelf werkt.
- Tweetalig maken kost extra tijd: Alle teksten, AI-feedback en foutmeldingen moeten dan in meerdere talen goed blijven.
- Eerst duidelijkheid: Voor de MVP is een simpele Nederlandse ervaring belangrijker dan taalkeuze.

## Eindadvies

De gekozen richting is passend voor een schoolproject en een educatieve MVP: gebruik bestaande technologie voor het canvas, houd de AI coachend in plaats van genererend, gebruik eenvoudige afbeeldingzoekactie en maak export simpel.

De niet gekozen alternatieven zijn vaak krachtiger, maar ook duurder, complexer of minder leerzaam voor de doelgroep. Voor MindFlow is dat belangrijk: het product moet leerlingen activeren, niet vervangen.

De beste volgende stap is daarom niet meer AI of meer functies, maar een duidelijkere en betrouwbaardere basis:

- Nederlandse UI-teksten.
- Lokale opslag.
- Zichtbare verwijderactie.
- Betere kindvriendelijke foutmeldingen.
- User test met 10-15 jarigen op begrip van de kernflow.
