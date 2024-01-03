const toggleButton = document.getElementById('toggleButton');
const message = document.getElementById('message');

// add checks for null
if (toggleButton === null) {
    throw new Error('toggleButton is null');
}
if (message === null) {
    throw new Error('message is null');
}

toggleButton.addEventListener('click', () => {
    message.style.display = message.style.display === 'none' ? 'block' : 'none';
});
