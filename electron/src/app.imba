tag App
  def setup
    @n = 0

  def score
    @n += 1

  def render
    <self>
      <header>
        "Hello, world!"
      <header>
        "Score: {@n}"
      <button :tap.score>
        "Get a point"

Imba.mount <App>
