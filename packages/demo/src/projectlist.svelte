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
        "description": "This is a test project to demonstrate the functionality of the CCP Explorer.",
        "cites": "",
        "category": "Clinical",
        "oncology": "Colorectal",
        "status": "Active",
        "project_time": "2021-2023",
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
    <h1>CCP Projektübersicht</h1>
    <h2>Verknüpfung von Forschungsdaten mit der CCP-Infrastruktur</h2>
    <p>lorem ipsum text or whatever</p>
    <div>
    {#each data as project}
        <div class="project">
            <h3>{project.name}</h3>
            <p><b>Titel:</b> {project.title}<br>
           <b>Beschreibung:</b> {project.description}<br>
            <b>Kategorie:</b> {project.category}<br>
            <b>Onkologie:</b> {project.oncology}<br>
            <b>Status:</b> {project.status}<br>
            <b>Projektzeit:</b> {project.project_time}<br></p>
        </div>
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