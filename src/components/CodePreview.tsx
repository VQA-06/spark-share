import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-batch';
import 'prismjs/components/prism-powershell';

const EXT_TO_LANG: Record<string, string> = {
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup',
  css: 'css',
  js: 'javascript', mjs: 'javascript',
  ts: 'typescript',
  jsx: 'jsx', tsx: 'tsx',
  py: 'python',
  java: 'java',
  c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  sql: 'sql',
  sh: 'bash', bash: 'bash',
  bat: 'batch', cmd: 'batch',
  ps1: 'powershell',
  yml: 'yaml', yaml: 'yaml',
  json: 'json',
  md: 'markdown', readme: 'markdown',
  toml: 'toml',
  ini: 'ini', cfg: 'ini', conf: 'ini', properties: 'ini',
  lua: 'lua',
  swift: 'swift',
  kt: 'kotlin',
  r: 'r',
  pl: 'perl', pm: 'perl',
  dockerfile: 'docker',
  makefile: 'makefile',
};

function getLang(fileName?: string): string {
  if (!fileName) return 'plain';
  const ext = fileName.split('.').pop()?.toLowerCase() || fileName.toLowerCase();
  return EXT_TO_LANG[ext] || 'plain';
}

interface CodePreviewProps {
  code: string;
  fileName?: string;
  className?: string;
}

const CodePreview = ({ code, fileName, className = '' }: CodePreviewProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const lang = getLang(fileName);

  useEffect(() => {
    if (codeRef.current && lang !== 'plain') {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, lang]);

  return (
    <pre className={`!bg-[hsl(var(--muted)/0.3)] !m-0 !border !border-border !rounded-b-lg text-sm leading-relaxed max-h-[50vh] overflow-auto ${className}`}>
      <code ref={codeRef} className={lang !== 'plain' ? `language-${lang}` : ''}>
        {code}
      </code>
    </pre>
  );
};

export default CodePreview;
