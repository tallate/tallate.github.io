const info = document.querySelector('#info');
const pages = document.querySelector('#pages');
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const file = new URLSearchParams(location.search).get('file');
const key = 'pdf-reader:' + (file || 'default');

function showError(error) {
  const message = error && error.message ? error.message : String(error);
  info.textContent = '加载失败';
  pages.textContent = `PDF 加载失败：${message}`;
}

function timeoutAfter(ms, label) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${label} 超时`)), ms);
  });
}

try {
  if (!file) {
    throw new Error('缺少 file 参数');
  }

  const pdfjsLib = await Promise.race([
    import('/lib/pdf-legacy/pdf.mjs?v=20260830-legacy'),
    timeoutAfter(10000, 'PDF.js 初始化')
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf-legacy/pdf.worker.mjs?v=20260830-legacy';

  const loadingTask = pdfjsLib.getDocument({
    url: file,
    rangeChunkSize: 1024 * 1024,
    disableAutoFetch: false,
    disableStream: false,
    disableRange: false
  });
  loadingTask.onProgress = progress => {
    if (progress && progress.loaded) {
      const total = progress.total ? ` / ${(progress.total / 1024 / 1024).toFixed(1)} MB` : '';
      info.textContent = `加载中 ${(progress.loaded / 1024 / 1024).toFixed(1)} MB${total}`;
    }
  };

  const pdf = await Promise.race([
    loadingTask.promise,
    timeoutAfter(30000, 'PDF 文档加载')
  ]);
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
