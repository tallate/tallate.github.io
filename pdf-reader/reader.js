import * as pdfjsLib from '/lib/pdf/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf/pdf.worker.mjs';
const file = new URLSearchParams(location.search).get('file');
const key = 'pdf-reader:' + (file || 'default');
const pdf = await pdfjsLib.getDocument({url: file, rangeChunkSize: 1024 * 1024, disableAutoFetch: false}).promise;
let pageNum = Math.min(Math.max(parseInt(localStorage.getItem(key) || '1', 10), 1), pdf.numPages);
const info = document.querySelector('#info'); const pages = document.querySelector('#pages');
async function render() { pages.replaceChildren(); info.textContent = `${pageNum} / ${pdf.numPages}`; const page = await pdf.getPage(pageNum); const viewport = page.getViewport({scale: 1.4}); const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height; pages.append(canvas); await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise; localStorage.setItem(key, pageNum); }
document.querySelector('#prev').onclick = () => { if (pageNum > 1) { pageNum--; render(); } };
document.querySelector('#next').onclick = () => { if (pageNum < pdf.numPages) { pageNum++; render(); } };
render();
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/kity@2.0.4/dist/kity.min.js"></script><script type="text/javascript" src="https://cdn.jsdelivr.net/npm/kityminder-core@1.4.50/dist/kityminder.core.min.js"></script><script defer="true" type="text/javascript" src="https://cdn.jsdelivr.net/npm/hexo-simple-mindmap@0.6.0/dist/mindmap.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/hexo-simple-mindmap@0.6.0/dist/mindmap.min.css">