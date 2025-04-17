import PropTypes from "prop-types";

/**
 * A stylized Japanese slate-like container for menu content
 */
function MenuContainer({
    children,
    animationState = "visible",
    className = "",
}) {
    const getTransform = () => {
        return animationState === "visible"
            ? "rotate(-1deg) translateY(0)"
            : "rotate(-1deg) translateY(50vh)";
    };

    const containerStyle = {
        backgroundColor: "#f9f3e5",
        border: "8px solid #ecdbc5",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        padding: "6px",
        position: "relative",
        maxWidth: "900px",
        margin: "0 auto",
        transform: getTransform(),
        transition:
            "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-out",
        opacity: animationState === "visible" ? 1 : 0,
    };

    const patternStyle = {
        content: "",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a78b6b' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        opacity: 0.5,
        pointerEvents: "none",
    };

    const innerStyle = {
        backgroundColor: "#f9f3e5",
        border: "2px solid #e1d1b3",
        borderRadius: "4px",
        padding: "20px",
        position: "relative",
        textAlign: "center",
    };

    const textureStyle = {
        content: "",
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
        <div style={containerStyle} className={className}>
            <div style={patternStyle} />
            <div style={innerStyle}>
                <div style={textureStyle} />
                {children}
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
};

export default MenuContainer;

