import React from 'react';

const GithubSection = () => {
  return (
    <section className="w-full py-20 px-4  text-center bg-gradient-to-b from-primary/5 to-white">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">Built With Precision</h2>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mt-2 mb-6">
          Explore Our <span className="text-primary">GitHub</span> Repository
        </h2>

        <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg mb-10">
          Explore the source code behind Interview Experience GSMCOE — thoughtfully architected,
          cleanly styled, and built with scalability and maintainability in mind. From design
          patterns to performance, every line reflects real-world engineering standards.
        </p>

        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl sm:text-2xl bg-primary hover:bg-primary-dull transition px-6 py-3 rounded-lg text-white font-medium"
        >
          Source Code
        </a>
      </div>
    </section>
  );
};

export default GithubSection;
