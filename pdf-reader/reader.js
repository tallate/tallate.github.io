import * as pdfjsLib from '/lib/pdf/pdf.mjs';

const info = document.querySelector('#info');
const pages = document.querySelector('#pages');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const file = new URLSearchParams(location.search).get('file');
const key = 'pdf-reader:' + (file || 'default');

pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf/pdf.worker.mjs';

function showError(error) {
  const message = error && error.message ? error.message : String(error);
  info.textContent = '加载失败';
  pages.textContent = `PDF 加载失败：${message}`;
}

try {
  if (!file) {
    throw new Error('缺少 file 参数');
  }

  const pdf = await pdfjsLib.getDocument({
    url: file,
    rangeChunkSize: 1024 * 1024,
    disableAutoFetch: false
  }).promise;
  let pageNum = Math.min(Math.max(parseInt(localStorage.getItem(key) || '1', 10), 1), pdf.numPages);

  async function render() {
    pages.replaceChildren();
    info.textContent = `${pageNum} / ${pdf.numPages}`;
    prev.disabled = pageNum <= 1;
    next.disabled = pageNum >= pdf.numPages;

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    pages.append(canvas);

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport
    }).promise;
    localStorage.setItem(key, pageNum);
  }

  prev.onclick = () => {
    if (pageNum > 1) {
      pageNum--;
      render().catch(showError);
    }
  };
  next.onclick = () => {
    if (pageNum < pdf.numPages) {
      pageNum++;
      render().catch(showError);
    }
  };

  await render();
} catch (error) {
  showError(error);
}
