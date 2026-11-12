/*! Klätterguiden – AI-chatt för Svenska Klätterförbundet (demo från Smartsvar).
    Läggs in på en sida med <script src=".../klatterforbundet-widget.js" defer></script>.
    Widgeten lägger sig nere till höger: en gul knapp, en popup efter ett par sekunder, och chatten när man klickar.

    Två lägen:
    1. Voiceflow: fyll i projectID i VF nedan. Då svarar agenten med prompten och kunskapsbasen.
    2. Demo: lämnas projectID tomt används de förinspelade svaren i DEMO (nyckelord, ingen AI). */
(function () {
  'use strict';
  if (window.KlatterChat) return;

  var VF = { projectID: '6af570ec527dcaa24e185820', versionID: 'production' };
  var SITE = 'https://www.klatterforbundet.se';

  var C = {
    name: 'Klätterguiden',
    opening: 'Hej! Jag svarar på frågor om medlemskap, Klätterförsäkringen, grönt och rött kort, kurser, tävling och klubbfrågor. I answer in English too.',
    teaser: 'Hej! Undrar du något om klättring, kort eller försäkring? Jag svarar direkt.',
    teaserChip: 'Hur tar jag grönt kort?',
    teaserDelay: 1800,
    thinking: { sv: 'Letar grepp', en: 'Finding the next hold' }
  };

  /* Knapparna följer säsongen: inomhus under vinterhalvåret, klippa och access under sommarhalvåret. */
  function season() {
    var m = new Date().getMonth() + 1;
    if (m >= 5 && m <= 9) return ['Börja klättra utomhus', 'Vad gäller vid häckande fåglar?', 'Gäller försäkringen utomlands?'];
    if (m === 11 || m === 12) return ['Hur tar jag grönt kort?', 'När börjar försäkringen gälla?', 'Nya avgifter för klubbar 2027'];
    return ['Hur tar jag grönt kort?', 'När börjar försäkringen gälla?', 'Hitta en klubb'];
  }
  C.suggestions = season();

  var CLUBS = [
    ['Norrbotten', 'luleå|gällivare|jokkmokk|kiruna|boden|piteå|norrbotten', 'Luleå Klätterklubb, Gällivare Klätterklubb, Jokkmokks Klätterklubb, Kiruna Klätterklubb K3, K4 Äventyrssport, Bodens Karateklubb och Piteå Klätterklubb'],
    ['Västerbotten', 'umeå|skellefteå|vännäs|västerbotten', 'Umeå klätter- och högfjällsklubb, IKSU, KFUM Umeå, KFUM Skellefteå Idrott och Empower Klättring Vännäs'],
    ['Jämtland', 'östersund|åre|härjedalen|strömsund|jämtland', 'Östersunds Klätterklubb, Åredalens Klätterklubb, Härjedalens Klätterklubb och Slagörnbergets Klätterklubb'],
    ['Västernorrland', 'sundsvall|härnösand|höga kusten|västernorrland', 'Sundsvalls Klätterklubb, Härnösands Klätterklubb och Höga Kustens Klätterklubb'],
    ['Gävleborg', 'gävle|bollnäs|hudiksvall|järvsö|gävleborg', 'Gästrike Klätterklubb, Bollnäs Klätterklubb, Hudiksvalls Klätterklubb och Järvsö Klätterklubb'],
    ['Dalarna', 'falun|borlänge|mora|malung|dalarna', 'Dalarnas Klätterklubb, Mora Klätterklubb och Malungs Klätterklubb'],
    ['Värmland', 'karlstad|arvika|värmland', 'Karlstad Klätterklubb och Jösse Klättersällskap'],
    ['Örebro län', 'örebro|lindesberg', 'Örebro Klätterklubb och Lindesbergs Klätterklubb'],
    ['Västmanland', 'västerås|västmanland', 'Västerås Klätterklubb'],
    ['Uppsala län', 'uppsala|enköping', 'Uppsala Klätterklubb, KFUM Uppsala Motus och Enköpings Klätterklubb'],
    ['Stockholms län', 'stockholm|solna|nacka|värmdö|tyresö|kista|norrtälje|södermalm', 'bland andra Stockholms Klätterklubb, Solna Klätterklubb, Södermalms Klätterförening, Nacka Värmdö Klätterklubb, Tyresö Klätterklubb, Karbin Klätterklubb och Kliff Paraklätterklubb (15 klubbar totalt)'],
    ['Södermanland', 'eskilstuna|nyköping|södermanland|sörmland', 'Eskilstuna Klätterklubb, Nyköpings Klätterklubb och Tunabergs Högfjälls och Klätterklubb'],
    ['Östergötland', 'linköping|norrköping|motala|östergötland', 'Linköpings Klätterklubb, Norrköpings Klätterklubb och Motala Klätterklubb'],
    ['Västra Götaland', 'göteborg|borås|alingsås|lerum|partille|lysekil|stenungsund|skövde|bohuslän|västra götaland', 'bland andra Göteborgs Klätterklubb, Kvibergs Klätterklubb, Bohusläns Klätterklubb, Borås Klätterklubb, Alingsås Klätterklubb, Lerums Klätterklubb och Billingens Klätterklubb (11 klubbar totalt)'],
    ['Jönköpings län', 'jönköping|värnamo|eksjö|tranås|sävsjö|småland', 'Jönköpings Klätterklubb, Värnamo Klätterklubb, Höglandsklättrarna i Eksjö och Tranås, Sävsjö Klätterklubb och Västbo Klätterklubb, med flera'],
    ['Kalmar län', 'kalmar|västervik|öland', 'Kalmar Klätterklubb, Västerviks Klätterklubb och Ölands Klätterklubb'],
    ['Gotland', 'gotland|visby', 'Visby Klätterklubb'],
    ['Halland', 'halmstad|varberg|halland', 'Halmstad Klätterklubb och Varbergs Klätterklubb'],
    ['Kronoberg', 'växjö|kronoberg', 'Växjö Klätterklubb'],
    ['Blekinge', 'karlskrona|blekinge', 'Karlskrona Bergsportförening'],
    ['Skåne', 'malmö|lund|helsingborg|höör|trelleborg|skåne', 'Malmö Klätterklubb, Klättersällskapet Gecko Malmö, Helsingborgs Klätterklubb, Höör Klätterklubb, Skånes Klätterklubb, Söderslätts Klätterklubb och C4 Climbing Club']
  ];

  /* Förinspelade svar för demoläget. Ordningen spelar roll: det mest specifika först. Uppgifterna följer kunskapsbas.md. */
  var DEMO = [
    { k: /112|medvetslös|blöder|akut/i, t: '**Ring 112** om läget är akut.\n\nNär det akuta är över: Råd & Vård nås på 020-44 11 11 vardagar 8–17, och skadan anmäls till Folksam på 0771-950 950.', s: ['Råd & Vård', '/om-forbundet/rad-vard/'] },
    { k: /trakass|mobb|kränk|övergrepp|otrygg|beter sig illa|obehag/i, t: 'Det ska ingen behöva vara med om. Klättringen ska vara fri från mobbning, trakasserier, hot, våld och övergrepp, och det gäller alla åldrar.\n\n- Akut läge: **112**. Misstanke om brott: polisen 114 14.\n- Idrottsombudsmannen: 08-627 40 10, idrottsombudsmannen@rf.se\n- Riksidrottsförbundets visselblåsartjänst är anonym, för ärenden där du inte kan gå till klubbens styrelse.\n- Bris stödlinje för idrottsledare: 077-440 00 42, vardagar 9–13.\n\nPå förbundet ansvarar Tove Wåhlin för social hållbarhet: tove.wahlin@klatterforbundet.rf.se, 072-500 14 27.', s: ['Trygg klättring', '/om-forbundet/trygg-klattring/'] },
    { k: /(kosta|pris|giltig|hur länge gäller|gammal|ålder|år måste|tappa|förlora|digital).*(kort)|(kort).*(kosta|pris|giltig|hur länge|gammal|ålder|tappa|förlora|digital)/i, t: 'Det står inte på förbundets sajt, så det kan jag inte svara säkert på. Pris, giltighetstid och åldersgräns för grönt och rött kort finns inte angivet.\n\nKursen hålls av klubbar och klättergym, så fråga den som håller kursen, eller mejla kansliet@klatterforbundet.rf.se.', s: ['Grönt och rött kort', '/utbildning/gront-och-rott-kort/'], c: ['Hur tar jag grönt kort?', 'Hitta en klubb'] },
    { k: /(utan|måste|behöver|krävs).*(rött kort)|(rött kort).*(utan|måste|behöver|krävs)|ledklättra utan/i, t: '**Nej, för att ledklättra och ledsäkra inomhus krävs rött kort.** Du tar det genom en kurs i ledklättring, som avslutas med uppklättring och teoriprov.\n\nGrönt kort räcker för att säkra på topprep. Bouldering kräver inget kort.', s: ['Grönt och rött kort', '/utbildning/gront-och-rott-kort/'], c: ['Vilka kurser finns?'] },
    { k: /grönt kort|rött kort|gröna kort|röda kort|topprepskort|ledkort|green card|red card/i, t: '**Grönt kort** är licensen för att säkra på topprep inomhus. Du tar det genom en kurs i topprepsklättring hos en klubb eller ett klättergym. Kursen avslutas med uppklättring och teoriprov.\n\n**Rött kort** är nästa steg och krävs för att ledklättra och ledsäkra. Det tar du genom en kurs i ledklättring.\n\nFörbundet har normer för båda kurserna, så innehållet är detsamma var du än går.', s: ['Grönt och rött kort', '/utbildning/gront-och-rott-kort/'], c: ['Vad kostar grönt kort?', 'Hitta en klubb'] },
    { k: /provar? på|prova-på|testa|kompis.*(med|följ)|inte medlem|icke.?medlem/i, t: '**Ja, vid prova på är även den som inte är medlem försäkrad**, så länge aktiviteten arrangeras av en klubb som är ansluten till förbundet.\n\nProva på hos andra arrangörer, till exempel ett gym utan klubb, nämns inte på sajten. Fråga i så fall arrangören vad som gäller.', s: ['Klätterförsäkringen', '/om-forbundet/klatterforsakringen/'], c: ['När börjar försäkringen gälla?'] },
    { k: /utomlands|utanför norden|resa|resor|kalymnos|fontainebleau|spanien|thailand|alperna|abroad|helikopter/i, t: 'Ja, Klätterförsäkringen gäller på klätterresor utomlands. **Utanför Norden gäller reseförsäkringen i upp till 45 dagar.**\n\n- Den täcker bland annat merkostnader för kost och logi vid olycksfall och akut sjukdom.\n- Hämtning och eftersök med helikopter ersätts med högst 100 000 kronor, och bara om du saknar annan försäkring.\n- Allvarlig skada utomlands: SOS International, +45 701 050 50.\n\nSjälvrisk och belopp står inte på sajten. De finns i Folksams villkor.', s: ['Klätterförsäkringen', '/om-forbundet/klatterforsakringen/'], c: ['Vad gäller om jag skadar mig?'] },
    { k: /skada|skadad|ont i|stuk|vrick|bruten|olycka|anmäl|injur/i, t: 'Ring **Råd & Vård på 020-44 11 11** (vardagar 8–17). Du får en telefontid med en fysioterapeut som är specialist på idrottsskador.\n\n- Behövs mer ingår upp till två besök hos fysioterapeut, ett läkarbesök och röntgen vid behov.\n- Olycksfall anmäls till Folksam på 0771-950 950.\n- Gör gärna en incidentrapport till förbundet, så att andra kan lära av det som hände.\n\nRåd & Vård ingår i Klätterförsäkringen för dig som är klubbmedlem.', s: ['Råd & Vård', '/om-forbundet/rad-vard/'], c: ['Gäller försäkringen utomlands?'] },
    { k: /vem (kontaktar|ringer|mejlar|ansvarar|ska jag)|kontaktperson/i, t: 'Det beror på frågan:\n\n- **Försäkring**: Andreas Enqvist, 070-238 69 46\n- **Klubbfrågor, utbildning och access**: Mikael Knutsson, 076-116 39 45\n- **Tävling och landslag**: Patrik Kleveback-Blom, patrik.blom@klatterforbundet.rf.se\n- **Trygg klättring**: Tove Wåhlin, 072-500 14 27\n- **Allt annat**: kansliet@klatterforbundet.rf.se', s: ['Kontakt', '/kontakt/'] },
    { k: /försäkr|insurance|folksam/i, t: '**Klätterförsäkringen börjar gälla när din medlemsavgift till klubben är betald.** Den ingår automatiskt i medlemskapet i en klubb som är ansluten till förbundet, och försäkringsbolaget är Folksam.\n\nDen gäller inomhus och utomhus, på träning och tävling, på direkt väg till och från klättringen och på klätterresor utomlands.\n\nUndantag: medlemmar i KFUM Jönköping, KFUM Umeå och Friluftsfrämjandet Mark omfattas inte.', s: ['Klätterförsäkringen', '/om-forbundet/klatterforsakringen/'], c: ['Gäller den vid prova på?', 'Gäller försäkringen utomlands?'] },
    { k: /fritidskort/i, t: 'Fritidskortet är ett statligt stöd som barn och unga kan betala sin klättring med, från det år barnet fyller 6 till det år det fyller 16.\n\n- **550 kronor per barn och år**, eller 2 500 kronor om vårdnadshavaren har bostadsbidrag.\n- Det kan betala medlemsavgift, träningsavgift och hyra av utrustning.\n- Klubben måste vara ansluten till registret. Det är gratis och görs på fritidskortet.se. Kraven är att klubben har fått LOK-stöd, har organisationsnummer och bankgiro eller plusgiro.', s: ['Fritidskortet', '/for-klubben/fritidskortet/'] },
    { k: /avgift|fakturer|höj|150|200 kr/i, t: 'Förbundsmötet 2026 beslutade om nya avgifter som klubbarna betalar till förbundet:\n\n- **150 kronor** per medlem till och med det år medlemmen fyller 18.\n- **200 kronor** per medlem från det år medlemmen fyller 19.\n- Lägst 1 000 kronor per klubb.\n\nDe gäller medlemsåret 2027 och faktureras i början av 2028. Fakturan i början av 2027 följer de gamla nivåerna. Klubben bestämmer själv om den höjer sin medlemsavgift, och står det i stadgarna att årsmötet beslutar kan ett extra årsmöte behövas före årsskiftet.', s: ['Nya avgifter till förbundet', '/2026/11/06/nya-medlemsavgifter-till-forbundet-fran-2027/'], c: ['Vilka bidrag kan klubben söka?'] },
    { k: /bidrag|projektstöd|stöd till|söka pengar|lok/i, t: 'Klubben kan söka flera stöd:\n\n- **Projektstöd** för projekt riktade till barn och unga 7–25 år, eller till klättrare med funktionsnedsättning. Ansökningar behandlas löpande, med svar inom cirka fyra veckor.\n- **LOK-stöd**, statens aktivitetsstöd för barn- och ungdomsidrott.\n- **Livslång klättring** för verksamhet för personer över 65 år.\n- **Accessfonden** för åtgärder som säkrar tillgången till klippor.\n\nLäger, material till ordinarie verksamhet och resor får inte projektstöd.', s: ['Sök bidrag', '/for-klubben/sok-bidrag/'], c: ['Hur fungerar fritidskortet?'] },
    { k: /starta.*(klubb|förening)|bilda.*(klubb|förening)|ny klubb/i, t: 'Ni behöver vara **minst tre personer och ha stadgar**. Utgå från Riksidrottsförbundets stadgemall, håll ett bildandemöte och välj en interimsstyrelse.\n\nAnsökan om medlemskap i förbundet görs via RF-SISU. Det kalenderår klubben ansluts är avgiftsfritt.', s: ['Driva förening', '/for-klubben/driva-forening/'], c: ['Nya avgifter för klubbar 2027'] },
    { k: /bygga|klättervägg|certifier|anläggning/i, t: 'Börja med kommunen, och ha underlag med er: målgrupp, intresse på orten, kostnader, läge och hur satsningen gynnar barn och unga.\n\nNär väggen står kan anläggningen **certifieras** av förbundet. Det är en säkerhetsgenomgång som förnyas varje år: ni gör en egenkontroll och skickar checklistan till kansliet. Det är gratis för förbundets klubbar och kostar 600 kronor för andra gym.', s: ['Bygga klättergym', '/for-klubben/bygga-klattergym/'] },
    { k: /instruktör|instructor/i, t: 'Det finns flera nivåer. Inomhus börjar du som **topprepsinstruktör**, sedan ledklätterinstruktör och högst auktoriserad klätterinstruktör inomhus. Utomhus finns hjälpinstruktör och auktoriserad instruktör i sport, klippa och is.\n\nVid examination ska du ha fyllt 18 år och vara medlem i en klubb. Licensen förnyas vart tredje år.', s: ['Bli instruktör', '/utbildning/instruktor/bli-instruktor/'] },
    { k: /tävl|sm\b|jsm|sverigecup|compet/i, t: 'Börja med en lokal bouldertävling genom din klubb eller ditt gym. Där är alla välkomna.\n\n- **JSM**: från det år du fyller 14 till det år du fyller 18.\n- **SM**: från det år du fyller 16, och du måste vara med i en klubb.\n- Kval till SM i boulder går via Sverigecupen Boulder.\n\nTävlingskalendern finns på climbalong.com/se/competitions', s: ['Tävla i klättring', '/tavling/tavla-i-klattring/'] },
    { k: /fågel|fåglar|häck|allemansrätt|access|markägare|klätterförbud|krita/i, t: 'Flyger en fågel nära och varnar kan den ha bo i närheten. **Lämna klippan direkt** och mejla access@klatterforbundet.se, så uppdateras Accessdatabasen.\n\nI övrigt gäller allemansrätten: stör inte och förstör inte. Borsta bort krita, låt mossa och träd vara och respektera närboende. Kolla vad som gäller på klippan i Accessdatabasen innan du åker: access.klatterforbundet.se', s: ['Gör rätt utomhus', '/utomhus/gor-ratt-utomhus/'] },
    { k: /säker|gammalt rep|hålla|utrustning|sele|karbin/i, t: 'Det kan jag inte bedöma. Om en viss utrustning eller säkring håller går inte att avgöra i en chatt.\n\nFörbundets råd är att bara använda UIAA- eller CE-märkt utrustning och att komma ihåg att rep, selar och slingor åldras. Be en auktoriserad instruktör eller din klubb titta på den.', s: ['Minimera riskerna', '/utomhus/minimera-riskerna/'] },
    { k: /utomhus|klippa|klippklättring|sportklättring|trad|outdoor/i, t: 'Börja med en kurs med auktoriserad instruktör: **sportklätterkurs** för bultade leder eller **grundkurs klippklättring** om du vill lära dig egna säkringar.\n\nFörbundet rekommenderar hjälm, kurs och en förare över området. Kolla Accessdatabasen innan du åker, och kom ihåg att du själv ansvarar för din säkerhet utomhus.', s: ['Börja klättra utomhus', '/utomhus/borja-klattra-utomhus/'], c: ['Vad gäller vid häckande fåglar?'] },
    { k: /kurs|utbildning|lära mig|course/i, t: 'Förbundet har normer för kurserna, så innehållet är detsamma överallt:\n\n- **Topprepsklättring** ger grönt kort, **ledklättring** ger rött kort.\n- Utomhus: sportklätterkurs och grundkurs klippklättring.\n- Fördjupning: fortsättningskurs klippa, räddningskurs 1 och 2, isklättring och mixklättring.\n\nKurserna hålls av klubbar och företag. Pris och datum står hos arrangören.', s: ['Gå en klätterkurs', '/utbildning/ga-en-klatterkurs/'], c: ['Hitta en klubb'] },
    { k: /märke|barn|unga|junior|dotter|son\b/i, t: 'För yngre klättrare finns **Klättermärket** och uppföljaren **Teknikmärket**. Varje märke har sju uppdrag som barnet gör tillsammans med en vuxen, till exempel att knyta dubbelåtta, göra kamratkontroll och klättra till toppen. När alla är klara får barnet en pin.\n\nFrån vilken ålder barn kan börja står inte på sajten. Det avgör klubben eller gymmet.', s: ['Klättermärken', '/for-klubben/klattermarken/'], c: ['Hur fungerar fritidskortet?', 'Hitta en klubb'] },
    { k: /skimo|skidalpin|topptur/i, t: 'Skidalpinism, eller skimo, är bergsbestigning på skidor: uppför med stighudar och sedan utför. Grenarna är individuell, vertikal, sprint, mixstafett, lag och stafett.\n\nSveriges största lopp är Keb Classic vid Kebnekaise. Är du klubbmedlem gäller Klätterförsäkringen på topptur upp till 6 000 meter.', s: ['Om skidalpinism', '/skimo/om-skimo/'] },
    { k: /rabatt|mina sidor|outnorth|kod/i, t: 'Rabattkoderna hämtar du via **Mina sidor**. Där fyller du i ett formulär och får ett mejl med dina koder, din försäkringsinformation och vilka klubbar du är medlem i.\n\nKommer inget mejl saknas troligen din mejladress i medlemsregistret. Hör då av dig till din klubb.', s: ['Mina sidor', '/mina-sidor/'] },
    { k: /kontakt|mejl|mail|ringa|telefon|vem|kansli|adress/i, t: 'Det beror på frågan:\n\n- **Försäkring**: Andreas Enqvist, 070-238 69 46\n- **Klubbfrågor, utbildning och access**: Mikael Knutsson, 076-116 39 45\n- **Tävling och landslag**: Patrik Kleveback-Blom, patrik.blom@klatterforbundet.rf.se\n- **Trygg klättring**: Tove Wåhlin, 072-500 14 27\n- **Allt annat**: kansliet@klatterforbundet.rf.se', s: ['Kontakt', '/kontakt/'] },
    { k: /börja|nybörjare|aldrig klättrat|komma igång|start/i, t: 'Så kommer du igång:\n\n- Hitta en klubb eller ett gym nära dig. Bouldering kan du prova direkt, utan rep och utan kort.\n- För repklättring går du en **kurs i topprepsklättring** och tar grönt kort.\n- Blir du medlem i en klubb ingår Klätterförsäkringen från att avgiften är betald.', s: ['Bli medlem', '/om-forbundet/om-oss/bli-medlem/'], c: ['Hitta en klubb', 'Hur tar jag grönt kort?'] },
    { k: /medlem|klubb|gå med|member|club/i, t: '**Du blir medlem genom en klubb.** Förbundet har ett 80-tal klubbar från Trelleborg till Kiruna, och det finns inget direktmedlemskap.\n\nKlubben bestämmer själv medlemsavgiften. I medlemskapet ingår Klätterförsäkringen, Råd & Vård vid skador och medlemsrabatter.\n\nSkriv din ort, så ser jag vilka klubbar som finns i närheten.', s: ['Våra klubbar', '/klubbar/'], c: ['När börjar försäkringen gälla?'] }
  ];
  var EN = { t: 'Yes. To belay indoors in Sweden you need a **green card** for top rope and a **red card** for lead. You earn each one through a course at a club or climbing gym, with a practical and a written test. Bouldering needs no card.\n\nMembership goes through a local club and includes the climbing insurance with Folksam, valid from the day your fee is paid.', s: ['Grönt och rött kort', '/utbildning/gront-och-rott-kort/'] };
  var FALLBACK = { t: 'Det hittar jag inget säkert svar på i förbundets material, så jag gissar inte.\n\nMejla kansliet@klatterforbundet.rf.se, så hamnar frågan hos rätt person. Jag svarar gärna om medlemskap, försäkring, kort, kurser, tävling och klubbfrågor.', c: ['Hur tar jag grönt kort?', 'När börjar försäkringen gälla?'] };

  var MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 26 12.5 9.5l4.6 7.4L20.6 12 29 26z" fill="currentColor"/><path d="M12.5 9.5 15 13.6l-2.2 1.9-2.1-1.6z" fill="#fff"/><circle cx="24.5" cy="7.5" r="2.6" fill="currentColor"/></svg>';

  var CSS = `
  :host{all:initial}
  *,*::before,*::after{box-sizing:border-box}
  .w{--ink:#232323;--ink2:#3A3A3A;--muted:#6B6B66;--line:#E4E2DC;--paper:#F7F6F2;--yel:#FFF200;--yel2:#F2E600;--sky:#00A6E2;
    --fd:'League Gothic','Oswald','Arial Narrow',Impact,sans-serif;--fb:'Cabin',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--ease:cubic-bezier(.2,.8,.2,1);--sb:env(safe-area-inset-bottom,0px);
    font-family:var(--fb);font-size:15.5px;line-height:1.55;color:var(--ink);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
  button,textarea{font:inherit;color:inherit;margin:0}
  button{cursor:pointer;background:none;border:0;padding:0;-webkit-tap-highlight-color:transparent}
  :focus{outline:none}:focus-visible{outline:2px solid var(--sky);outline-offset:2px}
  textarea:focus-visible{outline:none}
  svg{display:block}[hidden]{display:none!important}

  .panel{position:fixed;z-index:3;right:24px;bottom:96px;width:min(404px,calc(100vw - 32px));height:auto;max-height:calc(100vh - 120px);display:flex;flex-direction:column;overflow:hidden;border-radius:6px;background:#fff;
    box-shadow:0 0 0 1px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.05),0 36px 80px -30px rgba(0,0,0,.55);
    opacity:0;visibility:hidden;transform:translateY(14px);transform-origin:100% 100%;transition:opacity .22s,transform .32s var(--ease),visibility 0s .32s}
  .w.open .panel{opacity:1;visibility:visible;transform:none;transition:opacity .22s,transform .32s var(--ease),height .5s var(--ease)}
  .w[data-m=mobile] .panel{right:0;left:0;bottom:0;width:auto;max-height:calc(100dvh - 14px);border-radius:10px 10px 0 0;transform:translateY(100%);transition:transform .38s var(--ease),visibility 0s .38s}
  .w[data-m=mobile].has .panel{height:calc(100dvh - 14px)!important}
  .w[data-m=mobile].open .panel{transform:none;transition:transform .42s var(--ease)}
  .scrim{display:none}
  .w[data-m=mobile] .scrim{display:block;position:fixed;inset:0;z-index:3;background:rgba(10,10,10,.45);opacity:0;pointer-events:none;transition:opacity .3s}
  .w[data-m=mobile].open .scrim{opacity:1;pointer-events:auto}

  .head{position:relative;flex-shrink:0;overflow:hidden;color:#fff;background:#232323}
  .topo{position:absolute;inset:0;width:100%;height:100%;opacity:.5;pointer-events:none}
  .head::after{content:'';position:absolute;left:0;right:0;bottom:0;height:4px;background:var(--yel)}
  .bar{position:relative;display:flex;align-items:center;gap:4px;height:64px;padding:0 8px 0 18px}
  .brand{display:flex;align-items:center;gap:11px;margin-right:auto;min-width:0}
  .bm{width:34px;height:34px;flex-shrink:0;display:grid;place-items:center;background:var(--yel);color:var(--ink)}
  .bm svg{width:26px;height:26px}
  .bn{display:flex;flex-direction:column;line-height:1.05;min-width:0}
  .bn b{font-family:var(--fd);font-weight:400;font-size:23px;letter-spacing:.02em}
  .bn span{margin-top:3px;font-size:12px;color:rgba(255,255,255,.66);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ib{width:38px;height:38px;border-radius:4px;display:grid;place-items:center;color:rgba(255,255,255,.7);transition:background .15s,color .15s}
  .ib:hover{background:rgba(255,255,255,.12);color:#fff}
  .w:not(.has) .rs{display:none}
  .bigw{position:relative;display:grid;grid-template-rows:1fr;transition:grid-template-rows .55s var(--ease)}
  .w.has .bigw{grid-template-rows:0fr}
  .bigw>div{min-height:0;overflow:hidden}
  .big{padding:10px 22px 30px;transition:opacity .3s ease,transform .45s var(--ease)}
  .w.has .big{opacity:0;transform:translateY(-10px);pointer-events:none}
  .tag{display:inline-block;font-family:var(--fd);font-size:19px;letter-spacing:.03em;color:var(--yel)}
  .hl{margin:4px 0 0;font-family:var(--fd);font-weight:400;font-size:50px;line-height:.96;letter-spacing:.005em;text-wrap:balance;max-width:330px}
  .tg{margin:12px 0 0;font-size:14.5px;line-height:1.45;color:rgba(255,255,255,.78);max-width:320px}

  .body{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:#fff}
  .scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
  .msgs{display:flex;flex-direction:column;justify-content:flex-end;gap:14px;min-height:100%;padding:22px 20px 14px}
  .w.has .msgs{justify-content:flex-start}
  .day{align-self:center;font-size:11.5px;letter-spacing:.02em;color:var(--muted);padding:0 0 2px;animation:fade .3s both}
  .hero{display:flex;flex-direction:column;align-items:flex-start;animation:rise .5s var(--ease) .1s both}
  .op p{margin:0 0 10px}.op p:last-child{margin:0}
  .hero .chips{margin-top:16px}
  .me{align-self:flex-end;max-width:84%;width:fit-content;padding:10px 14px;border-radius:4px;background:var(--ink);color:#fff;white-space:pre-wrap;overflow-wrap:anywhere;animation:fade .25s both}
  .me+.bot,.bot+.me{margin-top:4px}
  .bot{align-self:stretch;min-width:0;animation:fade .25s both}
  .tx{overflow-wrap:anywhere}
  .tx p{margin:0 0 10px}.tx p:last-child{margin:0}
  .tx ul{margin:0 0 10px;padding:0;list-style:none}
  .tx li{position:relative;padding-left:18px;margin:0 0 6px}
  .tx li::before{content:'';position:absolute;left:2px;top:.62em;width:7px;height:7px;background:var(--yel);box-shadow:0 0 0 1px rgba(0,0,0,.28)}
  .tx b{font-weight:700}
  .tx a{color:var(--ink);font-weight:600;text-decoration:underline;text-decoration-color:var(--yel2);text-decoration-thickness:2px;text-underline-offset:3px}
  .tx a:hover{background:var(--yel)}
  .wd{display:inline;animation:fade .5s ease-out both}
  .src{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;margin-top:-2px;font-size:12.5px;color:var(--muted);text-decoration:none;animation:fade .4s both}
  .src i{font-style:normal;font-family:var(--fd);font-size:14px;letter-spacing:.04em;padding:1px 6px 0;background:var(--paper);box-shadow:inset 0 0 0 1px var(--line);color:var(--ink2)}
  .src u{text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
  .src:hover u{text-decoration-color:var(--ink);color:var(--ink)}
  .chips{display:flex;flex-wrap:wrap;gap:8px;animation:fade .4s both}
  .chips button{min-height:38px;padding:8px 14px;border-radius:3px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--ink);font-size:14px;font-weight:600;line-height:1.3;text-align:left;transition:background .15s,transform .15s}
  .chips button:hover{background:var(--yel)}
  .chips button:active{transform:scale(.98)}

  .think{display:inline-flex;align-items:center;gap:11px;min-height:30px;transition:opacity .22s ease}
  .think.gone{opacity:0}
  .route{position:relative;width:30px;height:30px;flex-shrink:0}
  .route i{position:absolute;width:9px;height:9px;border-radius:3px 5px 4px 6px;background:var(--line);animation:hold 1.5s ease-in-out infinite}
  .route i:nth-child(1){left:2px;bottom:1px}
  .route i:nth-child(2){left:11px;bottom:10px;animation-delay:.22s}
  .route i:nth-child(3){left:19px;bottom:20px;animation-delay:.44s}
  .shim{font-size:14.5px;font-weight:600;color:var(--muted)}

  .composer{flex-shrink:0;padding:6px 14px calc(10px + var(--sb));background:#fff}
  .field{display:flex;align-items:flex-end;gap:6px;padding:4px 4px 4px 14px;border-radius:4px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--line);transition:box-shadow .15s}
  .field:focus-within{box-shadow:inset 0 0 0 1.5px var(--ink)}
  textarea{flex:1;min-width:0;height:42px;max-height:124px;padding:10px 0;border:0;outline:0;resize:none;background:none;font-size:15.5px;line-height:1.4;color:var(--ink)}
  .w[data-m=mobile] textarea{font-size:16px}
  textarea::placeholder{color:var(--muted);opacity:1}
  .send{width:42px;height:42px;border-radius:3px;display:grid;place-items:center;flex-shrink:0;background:var(--paper);color:var(--muted);transition:background .15s,color .15s,transform .15s}
  .send:not(:disabled){background:var(--yel);color:var(--ink)}
  .send:not(:disabled):hover{background:var(--yel2)}
  .send:not(:disabled):active{transform:scale(.94)}
  .send:disabled{cursor:default}
  .foot{padding:9px 0 0;text-align:center;font-size:11.5px;color:var(--muted)}
  .foot a{color:var(--ink);font-weight:700;text-decoration:none}
  .foot .dot{margin:0 6px;opacity:.6}

  .launch{position:fixed;z-index:2;right:24px;bottom:calc(24px + var(--sb));display:flex;align-items:center;gap:10px;height:56px;padding:0 22px 0 14px;border-radius:3px;background:var(--yel);color:var(--ink);white-space:nowrap;
    box-shadow:0 1px 2px rgba(0,0,0,.2),0 14px 28px -12px rgba(0,0,0,.5);animation:pop .5s var(--ease) .3s both;transition:transform .25s var(--ease),background .15s}
  .launch:hover{transform:translateY(-2px);background:var(--yel2)}
  .launch svg{width:30px;height:30px}
  .launch .lt{font-family:var(--fd);font-size:25px;letter-spacing:.02em;padding-top:2px}
  .w.open .launch,.w.open .teaser{animation:none;opacity:0;pointer-events:none;transition:opacity .2s}
  .w[data-m=mobile] .launch{right:16px;bottom:calc(16px + var(--sb))}

  .teaser{position:fixed;z-index:2;right:24px;bottom:calc(92px + var(--sb));width:min(296px,calc(100vw - 36px));padding:14px 16px 16px;background:#fff;color:var(--ink);border-radius:4px;border-top:4px solid var(--yel);
    box-shadow:0 0 0 1px rgba(0,0,0,.07),0 4px 12px -4px rgba(0,0,0,.12),0 28px 60px -22px rgba(0,0,0,.5);animation:pop .45s var(--ease) both;cursor:pointer;transform-origin:100% 100%}
  .w[data-m=mobile] .teaser{right:16px;bottom:calc(84px + var(--sb))}
  .teaser .tn{margin:0 26px 6px 0;font-family:var(--fd);font-size:19px;letter-spacing:.03em}
  .teaser p{margin:0 0 12px;font-size:15px;line-height:1.45}
  .teaser .chips{animation:none}
  .teaser .chips button{min-height:36px;padding:7px 13px}
  .tx-x{position:absolute;top:7px;right:7px;width:28px;height:28px;border-radius:3px;display:grid;place-items:center;color:var(--muted)}
  .tx-x:hover{background:var(--paper);color:var(--ink)}

  @keyframes hold{0%,100%{background:var(--line);transform:none}35%{background:var(--yel);box-shadow:0 0 0 1px rgba(0,0,0,.35);transform:scale(1.25)}60%{background:var(--line);transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes pop{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
  `;

  /* Höjdkurvor i headern: en egen ritad topografi, ingen bild. */
  var TOPO = '<svg class="topo" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1" aria-hidden="true">' +
    '<path d="M250 -10c40 30 110 20 160 60M228 -10c44 52 120 44 182 96M204 -10c46 76 134 70 206 132M180 -10c44 100 150 98 230 170M150 -10c40 128 170 128 260 212M118 -10c34 160 190 162 292 256"/>' +
    '<path d="M-10 210c60-30 90 10 150 0s90-50 150-30 70 60 120 50M-10 236c60-26 96 8 152 0s96-44 150-26 70 52 118 46" stroke-opacity=".12"/></svg>';

  function svg(d, s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  var UI = { send: 'M12 19V5M5.5 11.5 12 5l6.5 6.5', reset: 'M4 12a8 8 0 1 0 2.4-5.7M4 4.5v4.3h4.3', down: 'M6 9.5l6 6 6-6', x: 'M6 6l12 12M18 6 6 18' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { return /^(https?:|mailto:|tel:)/i.test(u) ? u : 'https://' + u; }
  function inl(s) {
    var keep = [];
    function stash(h) { keep.push(h); return '\u0001' + (keep.length - 1) + '\u0001'; }
    s = s.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g, function (m, t, u) { return stash('<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>'); });
    s = s.replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, function (u) { return stash('<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') + '</a>'); });
    s = s.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/gi, function (e) { return stash('<a href="mailto:' + e + '">' + e + '</a>'); });
    s = s.replace(/(^|[^\w@/.-])((?:[a-z0-9-]+\.)+(?:se|com|nu|org)(?:\/[^\s<)]*[^\s<.,;:!?)])?)/gi, function (m, pre, u) { return pre + stash('<a href="' + safeUrl(u) + '" target="_blank" rel="noopener">' + u + '</a>'); });
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<b>$1</b>');
    return s.replace(/\u0001(\d+)\u0001/g, function (m, i) { return keep[+i]; });
  }
  function md(s) {
    return esc(s).trim().split(/\n\s*\n/).map(function (blk) {
      var lines = blk.split('\n'), out = '', list = [], para = [];
      function flush() {
        if (para.length) { out += '<p>' + inl(para.join('<br>')) + '</p>'; para = []; }
        if (list.length) { out += '<ul>' + list.map(function (l) { return '<li>' + inl(l) + '</li>'; }).join('') + '</ul>'; list = []; }
      }
      lines.forEach(function (l) {
        var m = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(l);
        if (m) { if (para.length) flush(); list.push(m[1]); } else { if (list.length) flush(); para.push(l); }
      });
      flush(); return out;
    }).join('');
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function loadFonts() {
    if (document.querySelector('link[data-kf-font]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-kf-font', '1');
    l.href = 'https://fonts.googleapis.com/css2?family=League+Gothic&family=Cabin:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Voiceflow ---------- */
  var live = !!VF.projectID, launched = false, mem = {};
  function vfUser() {
    var u = store('kf:u') || mem.u;
    if (!u) { u = 'kf-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); mem.u = u; store('kf:u', u); }
    return u;
  }
  function vfCall(action) {
    return fetch('https://general-runtime.voiceflow.com/public/' + encodeURIComponent(VF.projectID) + '/state/user/' + encodeURIComponent(vfUser()) + '/interact', {
      method: 'POST', headers: { 'Content-Type': 'application/json', versionID: VF.versionID || 'production' },
      body: JSON.stringify({ action: action, config: { tts: false, stripSSML: true } })
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function vfAsk(text) {
    var first = launched ? Promise.resolve() : vfCall({ type: 'launch' }).then(function () { launched = true; });
    return first.then(function () { return vfCall({ type: 'text', payload: text }); }).then(function (traces) {
      var parts = [], btn = [];
      (traces || []).forEach(function (t) {
        if (t.type === 'text' && t.payload && t.payload.message) parts.push(t.payload.message);
        if (t.type === 'choice' && t.payload && t.payload.buttons) t.payload.buttons.forEach(function (b) { if (b && b.name) btn.push(b.name); });
      });
      if (!parts.length) throw new Error('tomt svar');
      return { t: parts.join('\n\n'), c: btn.slice(0, 3) };
    });
  }

  function clubAnswer(text) {
    var low = text.toLowerCase();
    for (var i = 0; i < CLUBS.length; i++) {
      if (new RegExp('(^|[^a-zåäö])(' + CLUBS[i][1] + ')([^a-zåäö]|$)', 'i').test(low)) {
        return { t: 'I ' + CLUBS[i][0] + ' finns ' + CLUBS[i][2] + '.\n\n**Du blir medlem direkt hos klubben**, som också bestämmer avgiften. Länkar till alla klubbar finns i klubblistan.', s: ['Våra klubbar', '/klubbar/'], c: ['När börjar försäkringen gälla?', 'Hur tar jag grönt kort?'] };
      }
    }
    return null;
  }
  function demoAnswer(text) {
    var club = clubAnswer(text); if (club) return club;
    for (var i = 0; i < DEMO.length; i++) if (DEMO[i].k.test(text)) return DEMO[i];
    if (isEn(text)) return EN;
    return FALLBACK;
  }
  function isEn(text) { return /\b(the|what|when|where|how|hello|hi|is|are|do|does|can|my|need)\b/i.test(text) && !/[åäö]/i.test(text); }

  function mount() {
    loadFonts();
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    var host = document.createElement('div'); host.id = 'klatterforbundet-chat'; host.style.cssText = 'position:fixed;z-index:2147483000';
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style><div class="w">' +
      '<div class="scrim"></div>' +
      '<section class="panel" role="dialog" aria-label="Chatt med ' + esc(C.name) + '">' +
        '<header class="head">' + TOPO + '<div class="bar"><div class="brand"><span class="bm">' + MARK + '</span><span class="bn"><b>' + esc(C.name) + '</b><span>AI-assistent · Svenska Klätterförbundet</span></span></div>' +
          '<button class="ib rs" type="button" aria-label="Börja om" title="Börja om">' + svg(UI.reset, 17) + '</button>' +
          '<button class="ib x" type="button" aria-label="Minimera" title="Minimera">' + svg(UI.down, 21) + '</button></div>' +
          '<div class="bigw"><div><div class="big"><span class="tag">#viklättrar</span><h2 class="hl">Vad undrar du om klättring?</h2>' +
          '<p class="tg">Svar direkt om medlemskap, försäkring, kort, kurser och klubbfrågor, hämtade från förbundets egna sidor.</p></div></div></div></header>' +
        '<div class="body"><div class="scroll"><div class="msgs" role="log" aria-live="polite"></div></div>' +
        '<form class="composer"><div class="field"><textarea rows="1" enterkeyhint="send" aria-label="Skriv din fråga" placeholder="Skriv din fråga…"></textarea>' +
        '<button class="send" type="submit" aria-label="Skicka" disabled>' + svg(UI.send, 18) + '</button></div>' +
        '<div class="foot">' + esc(C.name) + ' är en AI och kan ha fel<span class="dot">·</span>Drivs av <a href="https://smartsvar.se" target="_blank" rel="noopener">Smartsvar</a></div></form></div>' +
      '</section>' +
      '<div class="teaser" role="button" tabindex="0" hidden><button class="tx-x" type="button" aria-label="Stäng">' + svg(UI.x, 14) + '</button>' +
        '<div class="tn">' + esc(C.name) + '</div><p>' + esc(C.teaser) + '</p><div class="chips"></div></div>' +
      '<button class="launch" type="button" aria-expanded="false" aria-label="Öppna chatten">' + MARK + '<span class="lt">Fråga oss</span></button>' +
      '</div>';

    var q = function (s) { return root.querySelector(s); };
    var w = q('.w'), msgs = q('.msgs'), scroll = q('.scroll'), ta = q('textarea'), sendB = q('.send'), launch = q('.launch'), teaser = q('.teaser'), panel = q('.panel');
    var busy = false, isOpen = false, lang = 'sv', timers = [], H = 620;
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function pin() { scroll.scrollTop = scroll.scrollHeight; }
    function measure() { w.dataset.m = innerWidth <= 600 ? 'mobile' : 'desktop'; if (w.classList.contains('has') && w.dataset.m !== 'mobile') panel.style.height = Math.min(H, innerHeight - 120) + 'px'; else if (w.dataset.m === 'mobile') panel.style.height = ''; }
    measure(); addEventListener('resize', measure);

    function chips(list) {
      var box = el('div', 'chips');
      list.forEach(function (t) { var b = el('button'); b.type = 'button'; b.textContent = t; b.onclick = function () { send(t); }; box.appendChild(b); });
      return box;
    }
    function greet() { var h = el('div', 'hero', '<div class="op">' + md(C.opening) + '</div>'); h.appendChild(chips(C.suggestions)); msgs.appendChild(h); }
    function stamp() { var t = new Date(); return 'Idag ' + ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2); }
    function thinkRow() {
      var row = el('div', 'bot');
      row.innerHTML = '<div class="tx"><span class="think" role="status"><span class="route" aria-hidden="true"><i></i><i></i><i></i></span><span class="shim">' + esc(C.thinking[lang]) + '…</span></span></div>';
      msgs.appendChild(row); return row;
    }
    function typeOut(row, text, done) {
      var tx = row.querySelector('.tx'), tmp = el('div', 'ti', md(text)), words = [];
      tx.innerHTML = ''; tx.appendChild(tmp);
      (function walk(n) { [].slice.call(n.childNodes).forEach(function (c) { if (c.nodeType === 3) { var frag = document.createDocumentFragment(); c.nodeValue.split(/(\s+)/).forEach(function (p) { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { var s = el('span', 'wd'); s.textContent = p; s.style.visibility = 'hidden'; s.style.animation = 'none'; words.push(s); frag.appendChild(s); } }); n.replaceChild(frag, c); } else walk(c); }); })(tmp);
      var lis = [].slice.call(tmp.querySelectorAll('li')); lis.forEach(function (li) { li.style.visibility = 'hidden'; });
      var i = 0, step = reduce ? 0 : Math.max(18, Math.min(40, 4200 / Math.max(words.length, 1)));
      (function tick() {
        if (!words.length) return done();
        var li = words[i].closest('li'); if (li) li.style.visibility = '';
        words[i].style.visibility = ''; words[i].style.animation = ''; i++; pin();
        if (i < words.length) { if (step) later(tick, step); else tick(); } else done();
      })();
    }
    function show(row, a) {
      var think = row.querySelector('.think'); think.classList.add('gone');
      later(function () {
        typeOut(row, a.t, function () {
          later(function () {
            if (a.s) { var l = el('a', 'src'); l.href = SITE + a.s[1]; l.target = '_blank'; l.rel = 'noopener'; l.innerHTML = '<i>KÄLLA</i><u>' + esc(a.s[0]) + ' på klatterforbundet.se</u>'; msgs.appendChild(l); }
            if (a.c && a.c.length) msgs.appendChild(chips(a.c));
            busy = false; sync(); pin();
          }, 220);
        });
      }, 240);
    }
    function send(text) {
      text = String(text || '').trim();
      if (!text || busy) return;
      open(); hideTeaser();
      [].forEach.call(msgs.querySelectorAll('.chips'), function (n) { n.remove(); });
      if (!w.classList.contains('has')) {
        msgs.appendChild(el('div', 'day', stamp()));
        panel.style.height = panel.offsetHeight + 'px'; void panel.offsetHeight;
        w.classList.add('has'); measure();
      }
      lang = isEn(text) ? 'en' : 'sv';
      var me = el('div', 'me'); me.textContent = text; msgs.appendChild(me);
      ta.value = ''; grow(); busy = true; sync();
      if (w.dataset.m === 'mobile') ta.blur();
      var row = thinkRow(); later(pin, 30); later(pin, 600);
      if (live) {
        vfAsk(text).then(function (a) { show(row, a); }, function () { show(row, { t: 'Just nu når jag inte svarstjänsten. Försök igen om en stund, eller mejla kansliet@klatterforbundet.rf.se.' }); });
      } else {
        var a = demoAnswer(text);
        later(function () { show(row, a); }, reduce ? 500 : 1500 + Math.random() * 500);
      }
    }
    function reset() { timers.forEach(clearTimeout); timers = []; busy = false; lang = 'sv'; msgs.innerHTML = ''; w.classList.remove('has'); panel.style.height = ''; launched = false; mem.u = null; store('kf:u', ''); greet(); sync(); }
    function sync() { sendB.disabled = busy || !ta.value.trim(); }
    function grow() { ta.style.height = '42px'; ta.style.height = Math.min(124, ta.scrollHeight) + 'px'; }
    function hideTeaser() { teaser.hidden = true; }
    function open() {
      if (isOpen) return; isOpen = true; w.classList.add('open'); launch.setAttribute('aria-expanded', 'true'); hideTeaser();
      if (w.dataset.m !== 'mobile') later(function () { ta.focus({ preventScroll: true }); }, 150);
      later(pin, 60);
    }
    function close() { if (!isOpen) return; isOpen = false; w.classList.remove('open'); launch.setAttribute('aria-expanded', 'false'); ta.blur(); }

    launch.onclick = function () { isOpen ? close() : open(); };
    q('.x').onclick = close;
    q('.scrim').onclick = close;
    q('.rs').onclick = function () { if (!busy) reset(); };
    teaser.onclick = function (e) { if (e.target.closest('button')) return; open(); };
    teaser.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    q('.tx-x').onclick = function (e) { e.stopPropagation(); hideTeaser(); };
    (function () { var b = el('button'); b.type = 'button'; b.textContent = C.teaserChip; b.onclick = function (e) { e.stopPropagation(); hideTeaser(); send(C.teaserChip); }; teaser.querySelector('.chips').appendChild(b); })();
    ta.addEventListener('input', function () { grow(); sync(); });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); } });
    q('form').addEventListener('submit', function (e) { e.preventDefault(); send(ta.value); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    reset();
    later(function () { if (!isOpen) teaser.hidden = false; }, C.teaserDelay);
    window.KlatterChat = { open: open, close: close, reset: reset, ask: send };
  }

  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
