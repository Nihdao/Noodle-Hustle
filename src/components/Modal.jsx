import PropTypes from "prop-types";

function Modal({ isOpen, onClose, title, children, className = "" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#f8f1e3]/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div
                className={`
                bg-gradient-to-br from-[#f9f3e5] to-[#eee5d3]
                text-[#8b5d33] rounded-xl
                w-full max-w-xl
                shadow-lg shadow-[#c17a0f]/20
                border border-[#e1d1b3]
                animate-modalAppear
                relative
                flex flex-col
                ${className}
            `}
            >
                <h2 className="text-2xl font-bold text-center text-[#8b5d33] tracking-wide drop-shadow-[0_0_10px_rgba(193,122,15,0.2)] px-6 pt-6 pb-3">
                    {title}
                </h2>

                <div className="flex-grow max-h-[75vh] overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
                    {children}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-[#c17a0f] hover:text-[#a36508] w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[#c17a0f]/10 hover:rotate-90 text-2xl leading-none"
                >
                    &times;
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

