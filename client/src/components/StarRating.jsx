import { useFormikContext } from 'formik';

function StarRating({ name }) {
  const formikProps = useFormikContext();

  const handleRating = (rate) => {
    formikProps.setFieldValue(name, rate);
  };

  // Ensure the rating stays within 0-5 range
  const currentRating = Math.min(Math.max(formikProps.values[name] || 0, 0), 5);

  return (
    <div
      style={{
        display: 'flex !important',
        alignItems: 'center !important',
        gap: '0.25rem !important'
      }}
    >
      {Array(5)
        .fill()
        .map((_, index) => (
          <span
            key={index}
            onClick={() => handleRating(index + 1)}
            style={{
              cursor: 'pointer',
              color: index < currentRating ? 'gold' : 'gray',
              fontSize: '40px'
            }}
          >
            ★
          </span>
        ))}
      {formikProps.touched[name] && formikProps.errors[name] && (
        <span className="text-red-600 text-sm">{formikProps.errors[name]}</span>
      )}
    </div>
  );
}

export default StarRating;
