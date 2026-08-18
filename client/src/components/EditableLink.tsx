import { useState } from "react";

interface EditableLinkProps {
    accessor: string
    currentLink: string
    onChange: (accessor: string, newLink: string) => void
}

export function EditableLink({accessor, currentLink, onChange }: EditableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentLink);

  const handleEdit = () => {
    setEditValue(currentLink)
    setIsEditing(true);
  };

  const handleDone = () => {
    onChange(accessor, editValue);
    setIsEditing(false);
  };

  return (
    <>
      <div className="link-component-container">
        {isEditing ? (
          <div className="link-edit-row">
            <div className="input-wrapper">
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
            </div>
            <div className="button-wrapper">
              <button className="link-edit-done-button" type="button" onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="link-display-row">
            <div className="url-wrapper">
              {currentLink ? (
                <a href={currentLink} target="_blank" rel="noreferrer" style={{color: 'coral'}}>
                  {currentLink}
                </a>
              ) : (
                <span style={{color: "white"}}>No link added</span>
              )}
            </div>
            <div className="button-wrapper">
              <button className="link-edit-button" type="button" onClick={handleEdit}>
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
