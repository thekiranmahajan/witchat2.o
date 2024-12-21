const AnimatedGridSection = ({ heading, subHeading }) => {
  return (
    <div className="hidden items-center justify-center bg-base-200 p-12 lg:flex">
      <div className="max-w-md text-center">
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-2xl bg-primary/10 ${index % 2 === 0 ? "animate-pulse bg-neutral/20" : ""}`}
            ></div>
          ))}
        </div>
        <h2 className="mb-4 text-2xl font-bold">{heading}</h2>
        <p className="text-base-content/60">{subHeading}</p>
      </div>
    </div>
  );
};

export default AnimatedGridSection;
