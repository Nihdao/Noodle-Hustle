import PropTypes from "prop-types";

/**
 * A stylized Japanese slate-like container for menu content
 */
function MenuContainer({
    children,
    animationState = "visible",
    className = "",
    scrollable = false,
    maxHeight = null,
    title = null,
    onClose = null,
}) {
    // Use Tailwind classes instead of inline styles where possible
    const containerBaseClasses = `
        relative rounded-lg overflow-hidden transition-all duration-700
        ${scrollable ? "" : "max-w-4xl mx-auto"}
        ${
            animationState === "visible"
                ? "opacity-100"
                : "opacity-0 translate-y-[50vh]"
        }
        ${className}
    `;

    const containerStyle = {
        backgroundColor: "var(--color-whiteCream, #f9f3e5)",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
        transform:
            animationState === "visible"
                ? "rotate(-1deg)"
                : "rotate(-1deg) translateY(50vh)",
        transition:
            "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease-out",
    };

    const borderStyle = {
        border: "8px solid var(--color-yellowWhite, #ecdbc5)",
        borderRadius: "8px",
        padding: "6px",
    };

    const innerStyle = {
        backgroundColor: "var(--color-whiteCream, #f9f3e5)",
        border: "2px solid var(--color-yellowWhite-dark, #e1d1b3)",
        borderRadius: "4px",
        position: "relative",
        padding: scrollable ? "0" : "20px",
        display: "flex",
        flexDirection: "column",
        maxHeight: scrollable && maxHeight ? maxHeight : "none",
    };

    // Background patterns
    const patternStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a78b6b' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        opacity: 0.5,
        pointerEvents: "none",
    };

    const textureStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
            "linear-gradient(45deg, rgba(167,139,107,0.05) 25%, transparent 25%, transparent 50%, rgba(167,139,107,0.05) 50%, rgba(167,139,107,0.05) 75%, transparent 75%, transparent)",
        backgroundSize: "4px 4px",
        pointerEvents: "none",
    };

    return (
        <div
            style={{ ...containerStyle, ...borderStyle }}
            className={containerBaseClasses}
        >
            <div style={patternStyle} />

            <div
                style={innerStyle}
                className={`${scrollable ? "overflow-hidden" : ""}`}
            >
                <div style={textureStyle} />

                {title && (
                    <div className="sticky top-0 z-10 border-b-2 border-[color:var(--color-yellowWhite-dark)] bg-[color:var(--color-whiteCream)] bg-opacity-95 p-3 flex justify-between items-center">
                        <div className="font-bold text-lg text-[color:var(--color-principalBrown)] flex-grow text-center">
                            {title}
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-[color:var(--color-principalBrown)] hover:text-[color:var(--color-principalRed)] transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                <div
                    className={`
                    ${scrollable ? "overflow-y-auto overflow-x-hidden" : ""}
                    flex-grow
                `}
                    style={{
                        maxHeight: scrollable && maxHeight ? maxHeight : "none",
                        padding: scrollable ? "16px" : "0",
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

MenuContainer.propTypes = {
    /** Content to display inside the container */
    children: PropTypes.node.isRequired,
    /** Animation state - 'visible' or 'hidden' */
    animationState: PropTypes.oneOf(["visible", "hidden"]),
    /** Additional CSS classes */
    className: PropTypes.string,
    /** Whether the container should allow scrolling for overflow content */
    scrollable: PropTypes.bool,
    /** Max height for scrollable containers (CSS value with units) */
    maxHeight: PropTypes.string,
    /** Optional title to display at the top of the container */
    title: PropTypes.string,
    /** Optional close handler function */
    onClose: PropTypes.func,
};

export default MenuContainer;

