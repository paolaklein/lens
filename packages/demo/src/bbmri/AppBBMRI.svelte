<script lang="ts">
  import "../../../lib";
  import type { CatalogueText } from "../../../lib/src/types/texts";
  import { diagnosisMeasureBbmriProd,
  patientsMeasureBbmriProd,
  specimenMeasureBbmriProd
} from "../measures";

  let mockCatalogueData = "";

  fetch("../catalogues/catalogue-bbmri.json")
    .then((response) => response.text())
    .then((data) => {
      mockCatalogueData = data;
    });

  let libraryOptions = ""

  fetch("optionsBBMRI.json")
    .then((response) => response.json())
    .then((data) => {
      libraryOptions = data
    });

  const measures = [
    diagnosisMeasureBbmriProd,
    patientsMeasureBbmriProd,
    specimenMeasureBbmriProd,
  ];

  const backendMeasures = `BBMRI_STRAT_DEF_IN_INITIAL_POPULATION`

  const catalogueText: CatalogueText = {
    group: "Group",
    collapseButtonTitle: "Collapse Tree",
    expandButtonTitle: "Expand Tree",
    numberInput: {
      labelFrom: "From",
      labelTo: "to",
    },
  };

  const resultSummaryConfig = [
    {
      key: "sites",
      title: "Standorte",
    },
    {
      key: "patients",
      title: "Patienten",
    },
  ];

  const catalogueKeyToResponseKeyMap = [
    ["gender", "Gender"],
    ["age_at_diagnosis", "Age"],
    ['diagnosis', 'diagnosis'],
    ['medicationStatements', "MedicationType"],
    ["sample_kind", 'sample_kind' ],
    ["therapy_of_tumor", "ProcedureType"],
    ["75186-7", "75186-7"],
    // ["encounter", "Encounter"],
  ];

  const siteToDefaultCollectionId: string[][] = [
    ["dresden", "bbmri-eric:ID:DE_BBD:collection:DILB"],
    ["frankfurt", "bbmri-eric:ID:DE_iBDF:collection:UCT"],
    ["berlin", "bbmri-eric:ID:DE_ZeBanC:collection:Onoloy"],
    ["wuerzburg", "bbmri-eric:ID:DE_ibdw:collection:bc"],
    ["brno", "bbmri-eric:ID:CZ_MMCI:collection:LTS"],
    ["aachen", "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC"],
    ["leipzig", "bbmri-eric:ID:DE_LMB:collection:LIFE_ADULT"],
    [
      "muenchen-hmgu",
      "bbmri-eric:ID:DE_Helmholtz-MuenchenBiobank:collection:DE_KORA",
    ],
    ["Pilsen", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma"],
    ["regensburg", "bbmri-eric:ID:DE_ZBR:collection:Tissue"],
    ["heidelberg", "bbmri-eric:ID:DE_BMBH:collection:Lungenbiobank"],
    ["luebeck", "bbmri-eric:ID:DE_ICBL:collection:ICBL"],
    ["augsburg", "bbmri-eric:ID:DE_ACBB:collection:TISSUE"],
    ["mannheim", "bbmri-eric:ID:DE_BioPsy:collection:Main_collecion"],
    ["marburg", "bbmri-eric:ID:DE_CBBMR:collection:main"],
    ["goettingen", "bbmri-eric:ID:DE_UMGB:collection:UMG-startegy"],
    ["hannover", "bbmri-eric:ID:DE_HUB:collection:ProBase"],
    ["olomouc", "bbmri-eric:ID:CZ_UPOL_LF:collection:all_samples"],
    ["prague-ffm", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma"],
    ["prague-ior", "bbmri-eric:ID:CZ_CUNI_LF1:collection:all_samples"],
  ];

  const uiSiteMap: string[][] = [
    ["berlin", "Berlin"],
    ["bonn", "Bonn"],
    ["dresden", "Dresden"],
    ["essen", "Essen"],
    ["frankfurt", "Frankfurt"],
    ["freiburg", "Freiburg"],
    ["hannover", "Hannover"],
    ["mainz", "Mainz"],
    ["muenchen-lmu", "München(LMU)"],
    ["muenchen-tum", "München(TUM)"],
    ["ulm", "Ulm"],
    ["wuerzburg", "Würzburg"],
    ["mannheim", "Mannheim"],
    ["dktk-test", "DKTK-Test"],
    ["hamburg", "Hamburg"],

  ];

  const backendConfig = {
    // url: "https://backend.demo.lens.samply.de/prod/",
    url: "http://localhost:8080",
    backends: [
      'mannheim',
      'freiburg',
      'muenchen-tum',
      'hamburg',
      'frankfurt',
      'berlin',
      'dresden',
      'mainz',
      'muenchen-lmu',
      'essen',
      'ulm',
      'wuerzburg',
    ],
    uiSiteMap: uiSiteMap,
    catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
  };


  const chartColors: string[] = [
      '#003674',
      '#1a4a82',
      '#335e90',
      '#4d729e',
      '#6686ac',
      '#809bba',
      '#99afc7',
  ];
  const chartBackgroudnColors: string[] = ["#e95713"];

</script>

<header>
  <div class="logo">
    <img
      src="../public/BBMRI-ERIC-gateway-for-health.svg"
      alt="Biobank Sweden logo"
    />
  </div>
  <div class="menu">
    <a href="https://www.bbmri-eric.eu/about/">About Us</a>
    <a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
    <!-- <a href="https://www.bbmri-eric.eu/bbmri-sample-and-data-portal/">Logout</a> -->
  </div>
</header>
<main>
  <div class="headings">
    <h1>BBMRI-ERIC Locator</h1>
    <h2>Search for human biospecimens across European biobanks</h2>
  </div>
  <div class="search">
    <lens-search-bar-multiple
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"No matches found"}
      measures={measures}
    >
    <lens-info-button iconUrl='../info-circle-svgrepo-com.svg' noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen." />
  <lens-search-button
    title="Search"
    {measures}
    backendConfig={JSON.stringify(backendConfig)}
    {backendMeasures}
  />
    </lens-search-bar-multiple>
  </div>
  <div class="grid">
    <div
      class="catalogue"
    >
      <lens-catalogue
        toggleIconUrl='right-arrow-svgrepo-com.svg'
        addIconUrl='long-right-arrow-svgrepo-com.svg'
        collapseButtonIconUrl='right-arrow-svgrepo-com.svg'
        treeData={JSON.stringify(mockCatalogueData)}
        texts={catalogueText}
        toggle={{ collapsable: true, open: false }}
      />
    </div>
    <div class="charts">
      <div class="chart-wrapper summary-bar">
        <lens-result-summary
        title="Ergebnisse"
        resultSummaryDataTypes={JSON.stringify(resultSummaryConfig)}
      />
      </div>
      <div class="chart-wrapper result-table">
        <lens-result-table pageSize="10" />
      </div>
      <div class="chart-wrapper chart-gender-distribution">
        <lens-chart
          title="Gender Distribution"
          backgroundColor={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
          catalogueGroupCode="gender"
          chartType="pie"
          displayLegends={true}
          clickToAddState={true}
        />
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Age Distribution"
          backgroundColor={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
          catalogueGroupCode="age_at_diagnosis"
          chartType="bar"
          clickToAddState={true}
          groupRange={10}
        />
      </div>
      <div class="chart-wrapper chart-specimens">
        <lens-chart
          title="Specimens"
          backgroundColor={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
          catalogueGroupCode="sample_kind"
          chartType="bar"
          clickToAddState={true}
        />
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnosis"
          backgroundColor={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
          catalogueGroupCode="diagnosis"
          chartType="bar"
          clickToAddState={true}
        />
      </div>
    </div>
  </div>
</main>

<footer>
  <a href="https://www.bbmri-eric.eu/privacy-notice/">Privacy Policy</a>
  <a href="">made with &#10084; & samply-lens</a>
  <div class="img-container">
    <img
      src="../public/logo-dkfz.svg"
      alt="german cancer research center logo"
    />
  </div>
  <div class="img-container">
    <img src="../public/GBN_logo.svg" alt="german biobank node logo" />
  </div>
  <div class="img-container">
    <img src="../public/logo_ce-en-rvb-lr.jpg" alt="european commission logo" />
  </div>
</footer>
<lens-options options={libraryOptions} catalogueData={mockCatalogueData}/>