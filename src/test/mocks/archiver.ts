const archiver = () => {
  throw new Error(
    'archiver mock invoked in tests. The download path is exercised end-to-end via the real package outside Jest.'
  );
};

export default archiver;
