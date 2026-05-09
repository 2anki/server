import { HTMLAttributes, ReactNode, useState } from 'react';
import styles from './DocsPage.module.css';

type PreProps = HTMLAttributes<HTMLPreElement> & { children?: ReactNode };

function getTextContent(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (typeof node === 'object' && 'props' in node) {
    const props = node.props as { children?: ReactNode } | null;
    if (props && 'children' in props) {
      return getTextContent(props.children);
    }
  }
  return '';
}

export function CodeBlock({ children, ...rest }: Readonly<PreProps>) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = getTextContent(children);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.codeWrapper}>
      <button
        type="button"
        className={styles.copyButton}
        onClick={onCopy}
        aria-label="Copy code to clipboard"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre {...rest}>{children}</pre>
    </div>
  );
}
