import { convert } from 'html-to-text';

const generateTextFromHTML = (html, limit = 300) => {
  const options = {
    selectors: [{ selector: 'img', format: 'skip' }],
  };
  const textContent = convert(html, options);
  return textContent.trimStart().slice(0, limit) + '...';
}; 

export default generateTextFromHTML; 