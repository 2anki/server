function handleRedirect(response: Response): boolean {
  if (response.redirected) {
    globalThis.location.href = response.url;
  }
  return response.redirected;
}

export default handleRedirect;
