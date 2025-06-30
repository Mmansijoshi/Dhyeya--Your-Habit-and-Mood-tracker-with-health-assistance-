const urlParams = new URLSearchParams(window.location.search);
const day = urlParams.get('day');
document.getElementById('diary-title').textContent = `Diary Entry - ${day}`;

function execCmd(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

function insertImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.style.maxWidth = '200px';  // Control width
    img.style.height = 'auto';
    img.style.float = 'right';     // Float to right
    img.style.margin = '10px';     // Add some space around it
    img.style.borderRadius = '10px';

    const editor = document.getElementById('editor');
    editor.appendChild(img);
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}


function saveEntry() {
  const content = document.getElementById('editor').innerHTML;
  fetch('save_entry.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'day=' + day + '&content=' + encodeURIComponent(content)
  }).then(response => alert('Saved!'));
}

window.onload = () => {
  fetch('load_entry.php?day=' + day)
    .then(res => res.text())
    .then(data => {
      document.getElementById('editor').innerHTML = data;
    });
};
