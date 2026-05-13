import React, { useState } from "react";

interface EditableLinkProps {
    accessor: string
    currentLink: string
    onChange: (accessor: string, newLink: string) => void
}

export function EditableLink({accessor, currentLink, onChange }: EditableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentLink);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDone = () => {
    onChange(accessor, editValue);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <>
          <input
            className="modal-link-input"
            name={accessor}
            type="text"
            value={editValue ?? ""}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleDone();
              }
            }}
            autoFocus
          />
          <button className="link-edit-done-button" type="button" onClick={handleDone}>
            Done
          </button>
        </>
      ) : (
        <>
          {currentLink ? (
            <a href={currentLink} target="_blank" rel="noreferrer" style={{color: 'coral'}}>
              {currentLink}
            </a>
          ) : (
            <span>No link added</span>
          )}
          <button className="link-edit-button" type="button" onClick={handleEdit}>
            Edit
          </button>
        </>
      )}
    </div>
  );
}
