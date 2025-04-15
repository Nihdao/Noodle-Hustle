import PropTypes from "prop-types";
import Modal from "./Modal";

function CreditsModal({ isOpen, onClose }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Credits"
            className="credits-modal"
        >
            <div className="space-y-6 text-center">
                <section className="bg-[#2c3e50]/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#d35400] border-b border-[#d35400]/30 pb-2 mb-3">
                        Game Information
                    </h3>
                    <p className="text-[#ecf0f1]">
                        Created for GameDevJS 2025 Game Jam
                    </p>
                </section>

                <section className="bg-[#2c3e50]/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#d35400] border-b border-[#d35400]/30 pb-2 mb-3">
                        Development Team
                    </h3>
                    <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-[#e67e22] uppercase tracking-wide">
                                Game Design & Development
                            </span>
                            <span className="text-lg font-semibold text-white">
                                Your Name
                            </span>
                        </div>
                    </div>
                </section>

                <section className="bg-[#2c3e50]/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#d35400] border-b border-[#d35400]/30 pb-2 mb-3">
                        Special Thanks
                    </h3>
                    <p className="text-[#ecf0f1]">
                        GameDevJS 2025 organizers and community
                    </p>
                </section>
            </div>
        </Modal>
    );
}

CreditsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CreditsModal;

