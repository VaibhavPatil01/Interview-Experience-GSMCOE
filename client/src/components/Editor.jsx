import { useFormikContext } from 'formik';
import { useRef, useEffect } from 'react';
import BlotFormatter from 'quill-blot-formatter';
import ImageCompress from 'quill-image-compress';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { editorPlaceholder } from '../assets/assets.js';

// Register modules
Quill.register('modules/imageCompress', ImageCompress);
Quill.register('modules/blotFormatter', BlotFormatter);

// Custom debug function for development only
const customDebug = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ImageCompress] ${message}`);
  }
};

// Production-ready modules configuration
const modules = {
  toolbar: [
    'bold',
    'italic',
    'underline',
    'strike',
    'code-block',
    { header: [1, 2] }, // Limit headers for simplicity
    { list: 'ordered' },
    { list: 'bullet' },
    { script: 'sub' },
    { script: 'super' },
    'link',
    'image',
    { color: [] },
    { background: [] },
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  },
  blotFormatter: {},
  imageCompress: {
    quality: 0.9, // Higher quality for production
    maxWidth: 800,
    maxHeight: 800,
    imageType: 'image/jpeg',
    debug: customDebug
  }
};

function Editor({ name }) {
  const formikProps = useFormikContext();
  const quillRef = useRef(null);

  const handleOnChange = (content, delta, source, editor) => {
    if (source === 'user') {
      formikProps.setFieldValue(name, editor.getHTML());
    }
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file && /^image\//.test(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const quill = quillRef.current.getEditor();
            if (quill) {
              const range = quill.getSelection(true);
              if (range) {
                quill.insertEmbed(range.index, 'image', e.target.result);
              } else {
                quill.insertEmbed(quill.getLength(), 'image', e.target.result);
              }
            }
          } catch (error) {
            console.error('Error inserting image:', error);
            alert('Failed to insert image. Please contact support.');
          }
        };
        reader.onerror = () => {
          console.error('FileReader error');
          alert('Error reading the image file.');
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    };
  };

  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.getEditor().getModule('toolbar');
      if (toolbar) {
        toolbar.addHandler('image', imageHandler);
      }
    }
  }, [quillRef]);

  return (
    <div className="mx-0.25 my-0.25">
      <ReactQuill
        ref={quillRef}
        modules={modules}
        theme="snow"
        readOnly={false}
        placeholder={editorPlaceholder}
        onChange={handleOnChange}
        value={formikProps.values[name] || ''}
      />
    </div>
  );
}

export default Editor;
