// Configuration
const DEEPGRAM_API_KEY = 'YOUR_DEEPGRAM_API_KEY'; // Replace with your actual API key
let isRecording = false;
let mediaRecorder;
let socket;
let transcript = '';

// DOM Elements
const toggleRecordingBtn = document.getElementById('toggleRecording');
const statusElement = document.getElementById('status');
const transcriptElement = document.getElementById('transcript');

// Event Listeners
toggleRecordingBtn.addEventListener('click', toggleRecording);

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Initialize MediaRecorder
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        // Setup Deepgram WebSocket connection
        socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
            'token', 
            DEEPGRAM_API_KEY
        ]);
        
        socket.onopen = () => {
            statusElement.textContent = 'Status: Recording...';
            toggleRecordingBtn.textContent = 'Stop Recording';
            isRecording = true;
        };
        
        socket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
                const text = data.channel.alternatives[0].transcript;
                if (text) {
                    transcript += text + ' ';
                    transcriptElement.value = transcript;
                }
            }
        };
        
        socket.onclose = () => {
            console.log('Deepgram connection closed');
        };
        
        socket.onerror = (error) => {
            console.error('Deepgram error:', error);
            statusElement.textContent = 'Status: Error occurred';
        };
        
        // Send audio data to Deepgram
        mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0 && socket.readyState === 1) {
                socket.send(event.data);
            }
        });
        
        // Start recording and send data every 250ms
        mediaRecorder.start(250);
        
    } catch (error) {
        console.error('Error starting recording:', error);
        statusElement.textContent = 'Status: Error - ' + error.message;
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    if (socket) {
        socket.close();
    }
    
    statusElement.textContent = 'Status: Ready';
    toggleRecordingBtn.textContent = 'Start Recording';
    isRecording = false;
}
