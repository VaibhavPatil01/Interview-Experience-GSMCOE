import slugify from 'slugify';

const generateSlug = (text) => {
  return slugify(text);
};

export default generateSlug;
