<script lang="ts">
type Project = {
    name: string;
    title: string;
    description: string;
    cites: string;
    category: string;
    oncology: string;
    status: string;
    project_time: string;
};

const data: Project[] = [
    {
        "name": "Testprojekt",
        "title": "Resection of metastsis in patients with RAS-mutated CRC",
        "description": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
        "cites": "Berlin, Dresden, Freiburg, Tübingen",
        "category": "Bildgebungsdaten, Bioprobendaten, klinische Daten ",
        "oncology": "Darmkrebs",
        "status": "aktiv",
        "project_time": "01/2022 - 01/2025 (geplant)",
    }
];

</script>

<header>
    <div class="header-wrapper">
        <div class="logo">
            <img src="../dktk.svg" alt="Logo des DKTK" />
        </div>
        <h1>CCP Explorer</h1>
        <div class="logo logo-dkfz">
            <img
                src="../Deutsches_Krebsforschungszentrum_Logo.svg"
                alt="Logo des DKTK"
            />
        </div>
    </div>
</header>
<main>
    <div class= "content">
    <img class="header" src="../header.png" alt="Header" />
    <h1 style="color:#E7E6E6;margin-bottom:0;">Testinstanz</h1>
    <h1><b>CCP Projektübersicht</b></h1>
    <h2>Verknüpfung von Forschungsdaten mit der CCP-Infrastruktur</h2>
    <p>Um Patienten im CCP Explorer identifizieren zu können, die in ein Forschungsprojekt eingeschlossen wurden, werden diese mit einem projekt-spezifisches Patienten-Pseudonym (PSP-ID) gekennzeichnet. In der folgenden Übersicht werden zu diesen im CCP Explorer aufgeführten Forschungsprojekten jeweils eine Kurzzusammenfassung sowie ausgewählte Metainformationen aufgeführt. Die dargestellten Informationen, etwa zu den Kategorien erhobener Daten, erlauben eine erste Einschätzung, ob vorhandene Daten aus diesem Projekt für ein geplantes Forschungsvorhaben relevant sein könnten. Die Forschungsdaten liegen in den jeweiligen Projekt-Datenbanken vor und können auf Anfrage durch die Projektleitung weitergeben werden. Wenn Sie an Forschungsdaten von einem der aufgeführten Projekte interessiert sind, wenden Sie sich bitte an die zentrale CCP-Koordination (ccp@dkfz.de). </p>
    <div class="list">
    {#each data as project}
    
            <h3>{project.name}</h3>
            <p><b>Titel:</b> {project.title}<br>
           <b>Projekt-Beschreibung:</b> {project.description}<br>
           <b>Standorte mit Patientenrekrutierung:</b> {project.cites}<br>
            <b>Kategorie der erhobenen Daten:</b> {project.category}<br>
            <b>Onkologische Entität:</b> {project.oncology}<br>
            <b>Status:</b> {project.status}<br>
            <b>Projektlaufzeit:</b> {project.project_time}<br></p>
        {/each}
    </div>
</div>
</main>

<footer>
    <a
        class="known-issues"
        href="https://hub.dkfz.de/s/iP6A7zJzAQya3iC"
        target="_blank"
    >
        Known Issues
    </a>
    <a
        href="https://dktk.dkfz.de/forschung/Plattformen-und-Technologie-Netzwerke/klinische-plattformen/ccp-faq"
        class="faq"
        target="_blank">FAQ</a
    >
    <a class="ccp" href="https://dktk.dkfz.de/ccp" target="_blank">
        Clinical Communication Platform (CCP)
    </a>
    <a class="email" href="mailto:CCP@dkfz.de">Kontakt</a>
    <a
        class="user-agreement"
        href="https://hub.dkfz.de/s/MPCg2kK23LH8Yii"
        download="nutzervereinbarung"
        target="_blank">Nutzungsvereinbarung</a
    >
    <a
        class="privacy-policy"
        href="https://hub.dkfz.de/s/M8Ldxd5GsfrQG9S"
        download="datenschutzerklaerung"
        target="_blank">Datenschutz</a
    >
    <a
        class="imprint"
        href="https://www.dkfz.de/de/impressum.html"
        target="_blank">Impressum</a
    >
</footer>