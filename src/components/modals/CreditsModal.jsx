import PropTypes from "prop-types";
import Modal from "../common/Modal";

/**
 * Modal showing game credits and attribution
 */
function CreditsModal({ isOpen, onClose }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Credits"
            className="credits-modal"
        >
            <div className="space-y-6 text-center">
                <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                    <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                        Game Information
                    </h3>
                    <p className="text-[#8b5d33] text-lg leading-relaxed">
                        Created for GameDevJS 2025 Game Jam
                    </p>
                </section>

                <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                    <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                        Development Team
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#8b5d33] uppercase tracking-wide">
                                Game Design & Development
                            </span>
                            <span className="text-xl font-semibold text-[#8b5d33]">
                                Your Name
                            </span>
                        </div>
                    </div>
                </section>

                <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                    <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                        Special Thanks
                    </h3>
                    <p className="text-[#8b5d33] text-lg leading-relaxed">
                        GameDevJS 2025 organizers and community
                    </p>
                </section>
            </div>
        </Modal>
    );
}

CreditsModal.propTypes = {
    /** Controls whether the modal is displayed */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
};

export default CreditsModal;

