document.addEventListener('page:loaded', () => {
  document.querySelectorAll('.pdf-container').forEach(element => {
    const frame = document.createElement('iframe');
    const file = `${window.location.origin}${element.dataset.target}`;
    frame.src = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(file)}`;
    frame.title = 'PDF reader';
    frame.loading = 'lazy';
    frame.style.width = '100%';
    frame.style.height = element.dataset.height;
    frame.style.border = '0';
    frame.setAttribute('allowfullscreen', '');
    element.replaceChildren(frame);
  });
});
