/**
 * comment in for npm package usage
 */
// import "@samply/lens";

import "../../lib";

// import "./fragment-development.css";
// import App from "./AppFragmentDevelopment.svelte";

//import "./ccp.css";
//import App from "./AppCCP.svelte";

import "./projectlist.css";
import App from "./projectlist.svelte";

// import App from './AppBBMRI.svelte'
// import './bbmri.css'

// import App from "./AppGBA.svelte"
// import './gba.css'

const app = new App({
    target: document.getElementById("app") as HTMLElement,
});

export default app;
