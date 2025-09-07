function RegisterSuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
      <div className="relative max-w-xl w-full bg-white rounded-lg shadow-lg overflow-hidden mx-5 p-8">
        <h1 className="text-2xl font-semibold relative">
          Please Verify your Email
          <span className="absolute left-0 bottom-0 h-1 w-8 bg-accent rounded-full"></span>
        </h1>
        <p className="pt-5 pb-2.5">
          Your account has been successfully registered, you may now close this tab. A mail has been
          sent to your email address, click on the verify button to verify your email address, and
          you will be able to log in using your email address and password.
        </p>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="cursor-pointer text-white bg-primary hover:bg-primary/90 font-medium text-base rounded-lg py-2.5 px-8"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterSuccessModal;
