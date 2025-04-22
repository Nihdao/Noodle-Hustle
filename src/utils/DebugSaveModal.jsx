import PropTypes from "prop-types";
import { useState } from "react";

function isObject(val) {
    return val && typeof val === "object" && !Array.isArray(val);
}

const AccordionSection = ({ label, value, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    const isComplex = isObject(value) || Array.isArray(value);
    return (
        <div style={{ marginBottom: 8, borderBottom: "1px solid #eee" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    background: "none",
                    border: "none",
                    color: "#222",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: 4,
                }}
                aria-expanded={open}
            >
                {open ? "▼" : "►"} {label}
            </button>
            {open && (
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                    {isComplex ? (
                        <pre
                            style={{
                                background: "#f5f5f5",
                                borderRadius: 8,
                                padding: 12,
                                fontSize: 13,
                                maxHeight: 300,
                                color: "#000",
                                overflow: "auto",
                            }}
                        >
                            {JSON.stringify(value, null, 2)}
                        </pre>
                    ) : (
                        <span style={{ color: "#444" }}>{String(value)}</span>
                    )}
                </div>
            )}
        </div>
    );
};

AccordionSection.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    defaultOpen: PropTypes.bool,
};

const DebugSaveModal = ({ open, onClose, content }) => {
    if (!open) return null;
    let parsed = null;
    try {
        parsed =
            content && typeof content === "string"
                ? JSON.parse(content)
                : content;
    } catch {
        // fallback: show as plain text
    }
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.5)",
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 24,
                    minWidth: 320,
                    maxWidth: 600,
                    maxHeight: "80vh",
                    overflow: "auto",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Debug: noodleBalanceSave</h3>
                {parsed && typeof parsed === "object" ? (
                    <div>
                        {Object.entries(parsed).map(([key, value]) => (
                            <AccordionSection
                                key={key}
                                label={key}
                                value={value}
                            />
                        ))}
                    </div>
                ) : (
                    <pre
                        style={{
                            background: "#f5f5f5",
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 13,
                            maxHeight: 400,
                            color: "#000",
                            overflow: "auto",
                        }}
                    >
                        {content}
                    </pre>
                )}
                <button
                    style={{
                        marginTop: 16,
                        background: "#222",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 18px",
                        fontSize: 14,
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

DebugSaveModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    content: PropTypes.string,
};

export default DebugSaveModal;

