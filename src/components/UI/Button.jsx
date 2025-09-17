const Button = ({ children, type = 'button', onClick, disabled, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-md text-sm disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
