import { lazy, Suspense, useEffect, useState } from 'react';
import styles from './CodeEditor.module.css';

const MonacoEditor = lazy(async () => {
  const mod = await import('@monaco-editor/react');
  const { loader } = mod;
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
    },
  });
  return { default: mod.default };
});

interface CodeEditorProps {
  language: 'html' | 'css';
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

interface FallbackProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

function PlainTextarea({ value, onChange, ariaLabel }: Readonly<FallbackProps>) {
  return (
    <textarea
      className={styles.fallback}
      aria-label={ariaLabel}
      spellCheck={false}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineNumbers: 'on' as const,
  folding: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  tabSize: 2,
};

export function CodeEditor({
  language,
  value,
  onChange,
  ariaLabel,
}: Readonly<CodeEditorProps>) {
  const [supportsMonaco, setSupportsMonaco] = useState(false);

  useEffect(() => {
    setSupportsMonaco(typeof window !== 'undefined' && 'Worker' in window);
  }, []);

  if (!supportsMonaco) {
    return (
      <PlainTextarea value={value} onChange={onChange} ariaLabel={ariaLabel} />
    );
  }

  return (
    <div className={styles.editorShell} aria-label={ariaLabel}>
      <Suspense
        fallback={
          <PlainTextarea
            value={value}
            onChange={onChange}
            ariaLabel={ariaLabel}
          />
        }
      >
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          onChange={(next) => onChange(next ?? '')}
          options={MONACO_OPTIONS}
          theme="vs-dark"
        />
      </Suspense>
    </div>
  );
}

export default CodeEditor;
