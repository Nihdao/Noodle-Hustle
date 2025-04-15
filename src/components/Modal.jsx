import PropTypes from "prop-types";

function Modal({ isOpen, onClose, title, children, className = "" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#2c3e50]/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className={`
                bg-gradient-to-br from-[#2c3e50] to-[#233140]
                text-[#ecf0f1] p-6 rounded-xl
                w-full max-w-lg mx-4
                shadow-lg shadow-[#d35400]/20
                border border-[#d35400]/20
                animate-modalAppear
                relative
                ${className}
            `}
            >
                <h2 className="text-2xl font-bold text-center mb-4 text-white tracking-wide drop-shadow-[0_0_10px_rgba(211,84,0,0.5)]">
                    {title}
                </h2>

                <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {children}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#e67e22] hover:text-[#d35400] w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[#d35400]/10 hover:rotate-90"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Modal;

