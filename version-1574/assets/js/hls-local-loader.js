import { H as LocalHls } from "./hls-vendor-dru42stk.js";

window.LocalHls = LocalHls;
window.dispatchEvent(new CustomEvent("local-hls-ready"));
