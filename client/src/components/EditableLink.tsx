import { useState } from "react";

interface EditableLinkProps {
    value: string
    onChange: (value: string) => void
}

export function EditableLink({ value, onChange }: EditableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center gap-2 min-h-[40px]">
      {isEditing ? (
        <>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border p-1 rounded w-full text-sm"
            placeholder="https://example.com"
            autoFocus
          />
          <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-green-600 font-bold">
            Done
          </button>
        </>
      ) : (
        <>
          {value ? (
            <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm truncate max-w-xs">
              {value}
            </a>
          ) : (
            <span className="text-gray-400 text-sm italic">No link added</span>
          )}
          <button type="button" onClick={() => setIsEditing(true)} className="text-xs text-gray-500 ml-auto hover:underline">
            Edit
          </button>
        </>
      )}
    </div>
  );
}
