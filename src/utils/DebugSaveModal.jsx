import PropTypes from "prop-types";
import { useState, useEffect } from "react";

function isObject(val) {
    return val && typeof val === "object" && !Array.isArray(val);
}

// Composant pour afficher des valeurs avec coloration
const ValueDisplay = ({ value, style = {} }) => {
    if (value === undefined)
        return (
            <span style={{ color: "#999", fontStyle: "italic", ...style }}>
                undefined
            </span>
        );
    if (value === null)
        return (
            <span style={{ color: "#999", fontStyle: "italic", ...style }}>
                null
            </span>
        );

    if (typeof value === "string")
        return <span style={{ color: "#0077aa", ...style }}>"{value}"</span>;
    if (typeof value === "number")
        return <span style={{ color: "#116644", ...style }}>{value}</span>;
    if (typeof value === "boolean")
        return (
            <span style={{ color: "#994400", ...style }}>
                {value.toString()}
            </span>
        );

    return <span>{String(value)}</span>;
};

ValueDisplay.propTypes = {
    value: PropTypes.any,
    style: PropTypes.object,
};

const AccordionSection = ({ label, value, defaultOpen = false, level = 0 }) => {
    const [open, setOpen] = useState(defaultOpen);
    const isComplex = isObject(value) || Array.isArray(value);

    const handleClick = () => setOpen((prev) => !prev);

    // Style conditionnel basé sur le niveau de profondeur
    const bgColor = level === 0 ? "#f8f9fa" : "transparent";
    const borderColor = level === 0 ? "#e9ecef" : "#f1f3f5";

    return (
        <div
            style={{
                marginBottom: level === 0 ? 12 : 4,
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: bgColor,
                borderRadius: level === 0 ? 8 : 0,
                padding: level === 0 ? "8px 12px" : "2px 0",
            }}
        >
            <button
                onClick={handleClick}
                style={{
                    background: "none",
                    border: "none",
                    color: "#222",
                    fontWeight: level === 0 ? 700 : 600,
                    fontSize: level === 0 ? 16 : 14,
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: 4,
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                }}
                aria-expanded={open}
            >
                <span style={{ marginRight: 8, color: "#555" }}>
                    {open ? "▼" : "►"}
                </span>
                <span>
                    {label}
                    {!isComplex && value !== undefined && (
                        <span style={{ marginLeft: 8 }}>
                            : <ValueDisplay value={value} />
                        </span>
                    )}
                    {isComplex && (
                        <span
                            style={{
                                marginLeft: 8,
                                color: "#666",
                                fontSize: "0.9em",
                            }}
                        >
                            {Array.isArray(value)
                                ? `[${value.length} items]`
                                : `{${Object.keys(value || {}).length} keys}`}
                        </span>
                    )}
                </span>
            </button>

            {open && isComplex && (
                <div style={{ marginLeft: 24, marginBottom: 8 }}>
                    {Array.isArray(value) ? (
                        value.length > 0 ? (
                            value.map((item, index) => (
                                <div key={index} style={{ marginBottom: 4 }}>
                                    {isObject(item) || Array.isArray(item) ? (
                                        <AccordionSection
                                            label={`[${index}]`}
                                            value={item}
                                            level={level + 1}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                display: "flex",
                                                marginBottom: 2,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#666",
                                                    marginRight: 8,
                                                }}
                                            >
                                                [{index}]:
                                            </span>
                                            <ValueDisplay value={item} />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <span
                                style={{ color: "#999", fontStyle: "italic" }}
                            >
                                Empty array
                            </span>
                        )
                    ) : Object.keys(value || {}).length > 0 ? (
                        Object.entries(value || {}).map(([key, val]) => (
                            <div key={key} style={{ marginBottom: 4 }}>
                                {isObject(val) || Array.isArray(val) ? (
                                    <AccordionSection
                                        label={key}
                                        value={val}
                                        level={level + 1}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            marginBottom: 2,
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "#666",
                                                marginRight: 8,
                                            }}
                                        >
                                            {key}:
                                        </span>
                                        <ValueDisplay value={val} />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <span style={{ color: "#999", fontStyle: "italic" }}>
                            Empty object
                        </span>
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
    level: PropTypes.number,
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            background: active ? "#fff" : "#f1f3f5",
            color: active ? "#222" : "#666",
            border: "none",
            borderRadius: "8px 8px 0 0",
            padding: "10px 16px",
            fontWeight: active ? 700 : 500,
            cursor: "pointer",
            marginRight: 4,
            boxShadow: active ? "0 -2px 5px rgba(0,0,0,0.05)" : "none",
            borderBottom: active ? "none" : "1px solid #ddd",
        }}
    >
        {children}
    </button>
);

TabButton.propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
};

const DebugSaveModal = ({ open, onClose, content, gameState }) => {
    const [activeTab, setActiveTab] = useState("both");
    const [parsedLocal, setParsedLocal] = useState(null);
    const [parsedGameState, setParsedGameState] = useState(null);

    // Mettre à jour les données parsées quand content ou gameState changent
    useEffect(() => {
        try {
            setParsedLocal(
                content && typeof content === "string"
                    ? JSON.parse(content)
                    : content
            );
        } catch {
            setParsedLocal(content);
        }

        setParsedGameState(
            gameState && typeof gameState === "object" ? gameState : null
        );
    }, [content, gameState]);

    if (!open) return null;

    const handleRefresh = () => {
        // L'événement sera intercepté par le parent (App.jsx) qui rechargera les données
        window.dispatchEvent(new CustomEvent("refreshDebugData"));
    };

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
                    minWidth: 800,
                    maxWidth: "90%",
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <h3 style={{ margin: 0 }}>Debug: Game State Inspector</h3>
                    <button
                        onClick={handleRefresh}
                        style={{
                            background: "#4c6ef5",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ marginRight: 6 }}>⟳</span> Refresh Data
                    </button>
                </div>

                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #ddd",
                        marginBottom: 16,
                    }}
                >
                    <TabButton
                        active={activeTab === "both"}
                        onClick={() => setActiveTab("both")}
                    >
                        Combined View
                    </TabButton>
                    <TabButton
                        active={activeTab === "localStorage"}
                        onClick={() => setActiveTab("localStorage")}
                    >
                        localStorage
                    </TabButton>
                    <TabButton
                        active={activeTab === "gameState"}
                        onClick={() => setActiveTab("gameState")}
                    >
                        GameState Singleton
                    </TabButton>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                    {(activeTab === "both" || activeTab === "localStorage") && (
                        <AccordionSection
                            label="LocalStorage (noodleBalanceSave)"
                            value={parsedLocal || content}
                            defaultOpen={activeTab !== "both"}
                        />
                    )}

                    {(activeTab === "both" || activeTab === "gameState") &&
                        parsedGameState && (
                            <AccordionSection
                                label="GameState (singleton)"
                                value={parsedGameState}
                                defaultOpen={activeTab !== "both"}
                            />
                        )}
                </div>

                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        style={{
                            background: "#222",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "10px 20px",
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                        onClick={onClose}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

DebugSaveModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    content: PropTypes.string,
    gameState: PropTypes.object,
};

export default DebugSaveModal;

