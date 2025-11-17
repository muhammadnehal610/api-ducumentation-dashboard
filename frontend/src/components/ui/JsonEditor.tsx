import React, { useState, useEffect } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, rows = 8 }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateJson(value);
  }, [value]);

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError("Invalid JSON: " + e.message);
      } else {
        setError("Invalid JSON format.");
      }
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setError(null);
    } catch (e) {
      // Error is already shown by validation
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`w-full font-mono text-sm p-2 bg-gray-800 text-white rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-700'}`}
          placeholder='{ "key": "value" }'
        />
        <button
          type="button"
          onClick={handleFormat}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded-md"
        >
          Format
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default JsonEditor;
