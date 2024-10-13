import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from '../images/Logo/fixed-removebg-preview.png';
import Searchicon from '../images/Logo/search.png';

const Navbar = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Function to fetch search suggestions
    const fetchSearchSuggestions = async (query) => {
        try {
            const response = await axios.get(`http://localhost:8000/search-suggestions/?q=${query}`);
            setSearchResults(response.data); // Update search results state
        } catch (error) {
            console.error("Error fetching search suggestions:", error);
        }
    };

    // Function to fetch search history
    const fetchSearchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:8000/search-history/');
            console.log('searchHistory:', response)
            setSearchHistory(response.data); // Update search history state
        } catch (error) {
            console.error("Error fetching search history:", error);
        }
    };

    // Fetch search history on component mount
    useEffect(() => {
        fetchSearchHistory();
    }, []);

    // Handle input change in search bar
    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query); // Update the search query state
        if (query) {
            fetchSearchSuggestions(query);
        } else {
            setSearchResults([]); // Clear results if input is empty
        }

        // Update URL with query
        const newParams = new URLSearchParams(window.location.search);
        newParams.set('q', query);
        window.history.replaceState(null, '', `${window.location.pathname}?${newParams.toString()}`);
    };

    // Handle search button click
    const handleSearch = () => {
        if (searchQuery) {
            // Redirect to the product list page with the search query
            window.location.href = `/product-list/?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    // Handle selection of suggestion
    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion); // Set selected suggestion as query
        setSearchResults([]); // Clear search results
        // Redirect to product list with the selected suggestion as the query
        window.location.href = `/product-list/?q=${encodeURIComponent(suggestion)}`;
    };

    // Handle search history item click
    const handleHistoryClick = (query) => {
        setSearchQuery(query); // Set selected history item as query
        setSearchResults([]); // Clear search results
        // Redirect to product list with the selected history item as the query
        window.location.href = `/product-list/?q=${encodeURIComponent(query)}`;
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-white shadow-md relative">
            {/* Logo Section */}
            <div className="cartlogo flex-shrink-0">
                <img src={Logo} alt="Logo" className="h-10"/>
            </div>

            {/* Search Bar for Desktop */}
            <div className="searchbar hidden md:flex flex-grow mx-4 relative">
                <input
                    type="text"
                    id="search-input"
                    placeholder="Search for the product you're looking for"
                    value={searchQuery}
                    onChange={handleInputChange} // Handle input change
                    className="flex-grow border border-gray-300 rounded-l-md py-2 px-4"
                />
                <button 
                    className="bg-gray-200 rounded-r-md p-2"
                    onClick={handleSearch} // Handle search button click
                >
                    <img src={Searchicon} alt="search" className="h-7" />
                </button>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div id="search-results" className="absolute bg-orange-100 shadow-lg mt-11 rounded z-10">
                        {searchResults.map((suggestion, index) => (
                            <div 
                                key={index} 
                                className="suggestion-item p-2 hover:bg-gray-200 cursor-pointer" 
                                onClick={() => handleSuggestionClick(suggestion)} // Handle suggestion click
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}

                {/* Search History */}
                {searchQuery.length === 0 && searchHistory.length > 0 && (
                    <div id="search-history" className="absolute bg-orange-100 shadow-lg mt-2 rounded z-10">
                        <div className="history-header p-2 font-bold">Recent Searches:</div>
                        {searchHistory.map((query, index) => (
                            <div 
                                key={index} 
                                className="history-item p-2 hover:bg-gray-200 cursor-pointer" 
                                onClick={() => handleHistoryClick(query)} // Handle history item click
                            >
                                {query}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Bar for Mobile */}
            <div className="searchbar flex-grow mx-4 md:hidden relative">
                <input 
                    type="text" 
                    id="search-input-mobile" 
                    placeholder="Search for the product you're looking for" 
                    value={searchQuery}
                    onChange={handleInputChange} // Handle input change
                    className="w-full border border-gray-300 rounded-md py-2 px-4"
                />
                {/* Search results for mobile */}
                {searchResults.length > 0 && (
                    <div id="search-results-mobile" className="absolute bg-orange-100 shadow-lg mt-2 rounded z-10">
                        {searchResults.map((suggestion, index) => (
                            <div 
                                key={index} 
                                className="suggestion-item p-2 hover:bg-gray-200 cursor-pointer" 
                                onClick={() => handleSuggestionClick(suggestion)} // Handle suggestion click
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* User and Cart Icons */}
            <div className="usershop-icon flex items-center space-x-4">
                <i className="fa fa-heart text-lg"></i>
                <i className="fa fa-shopping-cart text-lg"></i>
                <i className="fa fa-user text-lg"></i>
            </div>
        </nav>
    );
};

export default Navbar;
