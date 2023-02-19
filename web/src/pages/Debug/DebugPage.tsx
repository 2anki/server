import { getKeys } from './helpers/getKeys';

export function DebugPage() {
  return (
    <section className="section">
      <h1 className="title">Debug page</h1>
      <div className="container">
        <pre>
          {getKeys(localStorage).map(
            (key) =>
              `localStorage.setItem(${key}, ${JSON.stringify(
                localStorage.getItem(key)
              )});\n`
          )}
        </pre>
      </div>
    </section>
  );
}
