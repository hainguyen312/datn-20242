const Recording = require('../models/recording.model');

const handleSendRecording = async (req, res) => {
    try {
        const { callId, recordingUrl, channelId } = req.body;
        console.log('Received recording data:', { callId, recordingUrl, channelId });

        if (!callId || !recordingUrl || !channelId) {
            console.log('Missing required fields:', { callId, recordingUrl, channelId });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Tạo recording mới
        const newRecording = new Recording({
            channelId,
            callId,
            url: recordingUrl
        });

        await newRecording.save();
        console.log('Saved new recording successfully');

        res.status(200).json({ 
            message: 'Recording saved successfully',
            recording: newRecording
        });
    } catch (error) {
        console.error('Error saving recording:', error);
        res.status(500).json({ 
            error: 'Failed to save recording',
            details: error.message 
        });
    }
};

// API để lấy danh sách recordings của một channel
const getRecordings = async (req, res) => {
    try {
        const { channelId } = req.params;
        console.log('Getting recordings for channelId:', channelId);

        const recordings = await Recording.find({ channelId })
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

        console.log('Found recordings:', recordings.length);

        res.status(200).json({ recordings });
    } catch (error) {
        console.error('Error getting recordings:', error);
        res.status(500).json({ 
            error: 'Failed to get recordings',
            details: error.message 
        });
    }
};

module.exports = {
    handleSendRecording,
    getRecordings
}; 