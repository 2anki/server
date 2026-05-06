function handleRedirect(response: Response): boolean {
  if (response.redirected) {
    window.location.href = response.url;
  }
  return response.redirected;
}

export default handleRedirect;
