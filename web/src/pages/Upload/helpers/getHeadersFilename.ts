const getHeadersFilename = (headers: Response['headers']) => {
  const filename = headers.get('File-Name');
  if (!filename) {
    return null;
  }
  return decodeURIComponent(filename);
};

export default getHeadersFilename;
