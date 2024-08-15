document.addEventListener('DOMContentLoaded', (event) => {
  const container = document.querySelector('body'); // 根據需要選擇更具體的容器

  container.addEventListener('click', (event) => {
    if (event.target.classList.contains('copy-btn')) {
      const button = event.target;
      const codeBlock = button.previousElementSibling;
      const text = codeBlock.innerText;

      navigator.clipboard.writeText(text).then(() => {
        button.innerText = 'Copied!';
        setTimeout(() => {
          button.innerText = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  });

  document.querySelectorAll('pre code').forEach((codeBlock) => {
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.type = 'button';
    button.innerText = 'Copy';
    
    codeBlock.parentNode.appendChild(button);
  });

  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
});
