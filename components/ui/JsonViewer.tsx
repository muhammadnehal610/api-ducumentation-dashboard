import React from 'react';
import { Copy } from 'lucide-react';

interface JsonViewerProps {
  data: object;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);

  const syntaxHighlight = (json: string) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-green-500'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-400'; // key
        } else {
          cls = 'text-orange-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-500'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-500'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <div className="relative bg-gray-800 text-white rounded-md font-mono text-sm">
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-gray-400 bg-gray-700 hover:bg-gray-600 rounded-md"
        aria-label="Copy JSON"
      >
        <Copy size={16} />
      </button>
      <pre className="p-4 overflow-x-auto">
        <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonString) }} />
      </pre>
    </div>
  );
};

export default JsonViewer;
