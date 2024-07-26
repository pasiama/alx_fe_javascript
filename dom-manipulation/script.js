// Array to store quotes
let quotes = [];

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "The purpose of our lives is to be happy.", category: "Happiness" }
    ];
  }
  populateCategories();
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote)); // Save last viewed quote in session storage
}

// Function to add a new quote
function createAddQuoteForm() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();
    populateCategories();
    alert('New quote added!');
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Function to get filtered quotes based on selected category
function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

// Function to filter quotes
function filterQuotes() {
  const filteredQuotes = getFilteredQuotes();
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = ''; // Clear current quotes
  filteredQuotes.forEach(quote => {
    const quoteElement = document.createElement('div');
    quoteElement.textContent = `"${quote.text}" - ${quote.category}`;
    quoteDisplay.appendChild(quoteElement);
  });
  localStorage.setItem('selectedCategory', document.getElementById('categoryFilter').value);
}

// Function to populate categories dynamically
function populateCategories() {
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const selectedCategory = localStorage.getItem('selectedCategory');
  if (selectedCategory) {
    categoryFilter.value = selectedCategory;
  }
}

// Function to export quotes to JSON
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API URL

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    // Assume server returns an array of quote objects with 'text' and 'category' properties
    return serverQuotes.map(quote => ({
      text: quote.title, // Using 'title' as 'text' for simulation
      category: quote.body // Using 'body' as 'category' for simulation
    }));
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    return [];
  }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: quote.text, // Using 'title' as 'text' for simulation
        body: quote.category // Using 'body' as 'category' for simulation
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error posting quote to server:', error);
    return false;
  }
}


// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Event listener for the "Add Quote" button
document.getElementById('addQuoteButton').addEventListener('click', addQuote);

// Event listener for the "Export Quotes" button
document.getElementById('exportQuotes').addEventListener('click', exportToJson);

// Event listener for the "Import Quotes" file input
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Load initial quotes
loadQuotes();

// Load last viewed quote from session storage
const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
if (lastQuote) {
  document.getElementById('quoteDisplay').textContent = `"${lastQuote.text}" - ${lastQuote.category}`;
}

// Populate categories on initial load
populateCategories();

// Filter quotes on initial load
filterQuotes();


// Function to notify users about updates or conflicts
function notifyUser(message) {
  alert(message); // Simple alert for demonstration
}

// Enhanced sync function with conflict resolution notification
async function syncQuotesWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  // Detect conflicts and resolve them by prioritizing server quotes
  const conflictingQuotes = localQuotes.filter(localQuote =>
    serverQuotes.some(serverQuote => serverQuote.text === localQuote.text && serverQuote.category !== localQuote.category)
  );

  if (conflictingQuotes.length > 0) {
    notifyUser('Conflicts detected. Server data takes precedence.');
  }

  // Merge server and local quotes, prioritizing server quotes
  const mergedQuotes = [...serverQuotes, ...localQuotes.filter(localQuote =>
    !serverQuotes.some(serverQuote => serverQuote.text === localQuote.text && serverQuote.category === localQuote.category)
  )];

  // Update local storage with merged quotes
  localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;
  populateCategories();
  filterQuotes();
  notifyUser("Quotes synced with server!"); // Notification message for successful sync
}

// Enhanced addQuote function with conflict resolution notification
async function createAddQuoteForm() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();
    populateCategories();

    // Sync new quote with server
    const success = await postQuoteToServer(newQuote);
    if (success) {
      notifyUser('New quote added and synced with server!');
    } else {
      notifyUser('New quote added locally, but failed to sync with server.');
    }
  } else {
    notifyUser('Please enter both quote text and category.');
  }
}

// Function to sync quotes with the server
async function syncQuotesWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  
  // Merge server and local quotes, prioritizing server quotes
  const mergedQuotes = [...serverQuotes, ...localQuotes.filter(localQuote => 
    !serverQuotes.some(serverQuote => serverQuote.text === localQuote.text && serverQuote.category === localQuote.category)
  )];

  // Update local storage with merged quotes
  localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;
  populateCategories();
  filterQuotes();
}

// Periodically sync with the server every 5 minutes
setInterval(syncQuotesWithServer, 300000); // 300,000 milliseconds = 5 minutes

// Function to add a new quote and sync with the server
async function createAddQuoteForm() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();
    populateCategories();

    // Sync new quote with server
    const success = await postQuoteToServer(newQuote);
    if (success) {
      alert('New quote added and synced with server!');
    } else {
      alert('New quote added locally, but failed to sync with server.');
    }
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Initial sync with the server
syncQuotesWithServer();
