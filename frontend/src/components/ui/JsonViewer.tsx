
import React, { useState } from 'react';
import { Copy, ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: object;
}

const getJsonType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const JsonNode: React.FC<{ nodeKey: string, nodeValue: any, level: number }> = ({ nodeKey, nodeValue, level }) => {
  const type = getJsonType(nodeValue);
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const renderValue = () => {
    switch (type) {
      case 'string': return <span className="text-orange-400">"{nodeValue}"</span>;
      case 'number': return <span className="text-green-500">{nodeValue}</span>;
      case 'boolean': return <span className="text-purple-500">{String(nodeValue)}</span>;
      case 'null': return <span className="text-gray-500">null</span>;
      default: return null;
    }
  };

  const renderCollection = () => {
    const isArray = type === 'array';
    const entries = isArray ? nodeValue.map((_: any, i: number) => i) : Object.keys(nodeValue);
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';
    const length = entries.length;

    return (
      <div>
        <div onClick={toggleOpen} className="cursor-pointer inline-flex items-center">
          {isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
          <span className="text-blue-400">{nodeKey}:</span>
          <span className="text-gray-400 ml-2">{bracketOpen}</span>
          {!isOpen && <span className="text-gray-500 ml-1">...{length} items...</span>}
          {!isOpen && <span className="text-gray-400 ml-1">{bracketClose}</span>}
        </div>
        {isOpen && (
          <div style={{ paddingLeft: `${(level + 1) * 1.25}rem` }}>
            {entries.map((key: string | number, index: number) => (
              <JsonNode key={key} nodeKey={String(key)} nodeValue={nodeValue[key]} level={level + 1} />
            ))}
            <span className="text-gray-400">{bracketClose}</span>
          </div>
        )}
      </div>
    );
  };

  if (type === 'object' || type === 'array') {
    return renderCollection();
  }

  return (
    <div>
      <span className="text-blue-400">{nodeKey}:</span>
      <span className="ml-2">{renderValue()}</span>
    </div>
  );
};


const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);

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
      <div className="p-4 overflow-x-auto">
        <span className="text-gray-400">{Array.isArray(data) ? '[' : '{'}</span>
        <div className="pl-5">
            {Object.keys(data).map(key => (
              <JsonNode key={key} nodeKey={key} nodeValue={(data as any)[key]} level={0} />
            ))}
        </div>
        <span className="text-gray-400">{Array.isArray(data) ? ']' : '}'}</span>
      </div>
    </div>
  );
};

export default JsonViewer;