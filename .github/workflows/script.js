const startBtn = document.getElementById('startBtn');
const output = document.getElementById('output');

// Check if browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    startBtn.onclick = () => {
        if (startBtn.textContent === 'Start Listening') {
            recognition.start();
            startBtn.textContent = 'Stop Listening';
        } else {
            recognition.stop();
            startBtn.textContent = 'Start Listening';
        }
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        output.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Error:', event.error);
        startBtn.textContent = 'Start Listening';
    };
} else {
    output.value = "Sorry, your browser doesn't support speech recognition. Try Chrome or Edge.";
    startBtn.disabled = true;
}
