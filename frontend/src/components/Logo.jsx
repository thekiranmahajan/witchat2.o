const Logo = ({ className }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-neutral/90 transition-colors group-hover:bg-neutral ${className ? className : "size-12"}`}
    >
      <img
        src="logo.svg"
        alt="logo"
        className={className ? "size-12" : "size-7"}
      />
    </div>
  );
};

export default Logo;
