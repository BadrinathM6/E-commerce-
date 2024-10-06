$(document).ready(function() {
    var searchInput = $('#search-input');
    var searchResults = $('<div id="search-results"></div>').insertAfter(searchInput);
    var debounceTimeout;

    // Function to display search history
    function displaySearchHistory() {
        $.ajax({
            url: 'search-history/',
            success: function(data) {
                searchResults.empty();
                if (data.length > 0) {
                    searchResults.append('<div class="history-header">Recent Searches:</div>');
                    data.forEach(function(query) {
                        searchResults.append('<div class="history-item">' + query + '</div>');
                    });
                    searchResults.show();
                }
            }
        });
    }

    // Trigger search history on focus if input is empty
    searchInput.on('focus', function() {
        if ($(this).val().length === 0) {
            displaySearchHistory();
        }
    });
    
    // Function to handle search suggestions with debounce
    searchInput.on('input', function() {
        var query = $(this).val().trim();
        
        clearTimeout(debounceTimeout);  // Clear the previous debounce timer
        
        if (query.length > 0) {
            debounceTimeout = setTimeout(function() {
                // AJAX request for search suggestions
                $.ajax({
                    url: 'search-suggestions/',
                    data: {
                        'q': query
                    },
                    success: function(data) {
                        searchResults.empty();
                            data.forEach(function(suggestion) {
                                searchResults.append('<div class="suggestion">' + suggestion + '</div>');
                            });
                            if(data.length>0){
                                searchResults.show();
                        } else {
                                searchResults.hide();  // Hide if no suggestions
                        }
                    }
                });
            }, 300);  // Debounce delay of 300ms (adjust as needed)
        } else {
            displaySearchHistory();
        }
    });

    // Event for clicking on suggestions or history items
    $(document).on('click', '.suggestion, .history-item', function() {
        searchInput.val($(this).text());
        searchResults.hide();
        window.location.href = '/product-list/?q=' + encodeURIComponent($(this).text());
    });

    // Redirect on pressing enter key
    searchInput.on('keypress', function(e) {
        if (e.which == 13) {
            window.location.href = '/product-list/?q=' + encodeURIComponent($(this).val());
        }
    });

    // Hide search results if clicked outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.searchbar').length) {
            searchResults.hide();
        }
    });
});
