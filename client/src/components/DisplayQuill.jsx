import ReactQuill, { Quill } from 'react-quill';
import BlotFormatter from 'quill-blot-formatter';
import ImageCompress from 'quill-image-compress';
import 'react-quill/dist/quill.snow.css';
// import './quill.css';

Quill.register('modules/imageCompress', ImageCompress);
Quill.register('modules/blotFormatter', BlotFormatter);

function DisplayQuill({ content }) {
  return (
    <div className="my-0.25">
      <ReactQuill theme="bubble" readOnly value={content} />
      <style>{'.ql-editor {padding: 0rem;}'}</style>
    </div>
  );
}

export default DisplayQuill;
