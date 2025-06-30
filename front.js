document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('entryForm');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      // Collect values from your input fields
      const entry_date = document.getElementById('entry_date').value;
      const exercise = document.getElementById('exercise').value;
      const mood = document.getElementById('mood').value;
      const sleep_range = document.getElementById('sleep_range').value;
      const productivity = document.getElementById('productivity').value;
      const water_count = parseInt(document.getElementById('water_count').value);
      const todo_list = document.getElementById('todo_list').value.split('\n');
      const gratitude = document.getElementById('gratitude').value.split('\n');
  
      const data = {
        entry_date,
        exercise,
        mood,
        sleep_range,
        productivity,
        water_count,
        todo_list,
        gratitude
      };
  
      try {
        const response = await fetch('http://localhost:3001/api/save-entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        const result = await response.json();
  
        if (result.success) {
          alert('Entry saved successfully!');
          form.reset();
        } else {
          alert('Error saving entry: ' + result.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Could not connect to server.');
      }
    });
  });
  