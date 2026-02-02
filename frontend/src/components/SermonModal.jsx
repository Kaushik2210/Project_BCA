import React from 'react';

const SermonModal = ({ sermon, onClose }) => {
    if (!sermon) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">View Sermon</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                        </label>
                        <p className="text-gray-900 text-lg">{sermon.title}</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <p className="text-gray-700 whitespace-pre-wrap">{sermon.description}</p>
                    </div>

                    {/* Audio Player */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sermon Audio
                        </label>
                        <audio controls className="w-full">
                            <source src={sermon.sermon_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                    {/* Audio Link */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Audio URL
                        </label>
                        <a
                            href={sermon.sermon_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                        >
                            {sermon.sermon_url}
                        </a>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SermonModal;
