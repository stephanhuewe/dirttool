document.addEventListener('DOMContentLoaded', () => {
  const toolsList = document.getElementById('tools-list');
  const addToolForm = document.getElementById('add-tool-form');
  const toolNameInput = document.getElementById('tool-name');
  const errorMessage = document.getElementById('error-message');
  
  // Fetch and display all tools
  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      const tools = await response.json();
      
      displayTools(tools);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toolsList.innerHTML = '<div class="error">Failed to load tools. Please try again later.</div>';
    }
  };
  
  // Display tools in the UI
  const displayTools = (tools) => {
    if (tools.length === 0) {
      toolsList.innerHTML = '<div class="no-tools">No tools added yet. Be the first to add one!</div>';
      return;
    }
    
    toolsList.innerHTML = '';
    
    tools.forEach((tool, index) => {
      const toolItem = document.createElement('div');
      toolItem.className = 'tool-item';
      
      toolItem.innerHTML = `
        <div class="tool-info">
          <span class="rank">#${index + 1}</span>
          <span class="tool-name">${escapeHtml(tool.name)}</span>
        </div>
        <div class="votes">
          <span class="vote-count">${tool.votes} vote${tool.votes !== 1 ? 's' : ''}</span>
          <button class="vote-btn" data-id="${tool.id}">Vote</button>
        </div>
      `;
      
      toolsList.appendChild(toolItem);
    });
    
    // Add event listeners to vote buttons
    document.querySelectorAll('.vote-btn').forEach(button => {
      button.addEventListener('click', handleVote);
    });
  };
  
  // Handle voting for a tool
  const handleVote = async (event) => {
    const toolId = event.target.getAttribute('data-id');
    
    try {
      const response = await fetch(`/api/tools/${toolId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote');
      }
      
      // Refresh the tools list
      fetchTools();
    } catch (error) {
      console.error('Error voting for tool:', error);
    }
  };
  
  // Handle adding a new tool
  const handleAddTool = async (event) => {
    event.preventDefault();
    
    const toolName = toolNameInput.value.trim();
    
    if (!toolName) {
      showError('Please enter a tool name');
      return;
    }
    
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: toolName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add tool');
      }
      
      // Clear the input and error message
      toolNameInput.value = '';
      clearError();
      
      // Refresh the tools list
      fetchTools();
    } catch (error) {
      showError(error.message);
      console.error('Error adding tool:', error);
    }
  };
  
  // Show error message
  const showError = (message) => {
    errorMessage.textContent = message;
  };
  
  // Clear error message
  const clearError = () => {
    errorMessage.textContent = '';
  };
  
  // Escape HTML to prevent XSS
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  // Event listeners
  addToolForm.addEventListener('submit', handleAddTool);
  
  // Initial fetch
  fetchTools();
});
