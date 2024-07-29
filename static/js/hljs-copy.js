document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('pre code').forEach((codeBlock) => {
    // Create a button element
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.type = 'button';
    button.innerText = 'Copy';
    
    // Attach the button to the code block
    codeBlock.parentNode.appendChild(button);

    // Add click event listener
    button.addEventListener('click', () => {
      const text = codeBlock.innerText;
      navigator.clipboard.writeText(text).then(() => {
        button.innerText = 'Copied!';
        setTimeout(() => {
          button.innerText = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });

  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
});
