import React from 'react';
import Logo from '../images/Logo/fixed-removebg-preview.png';
import Searchicon from '../images/Logo/search.png';

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between p-4 bg-white shadow-md">
            {/* Logo Section */}
            <div className="cartlogo flex-shrink-0">
                <img 
                    src={Logo} 
                    alt="Logo" 
                    className="h-10"
                />
            </div>

            {/* Search Bar */}
            <div className="searchbar hidden md:flex flex-grow mx-4">
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Search for the product you're looking for" 
                    className="flex-grow border border-gray-300 rounded-l-md py-2 px-4"
                />
                <button className="bg-gray-200 rounded-r-md p-2">
                    <img 
                        src={Searchicon} 
                        alt="search" 
                        className="h-7"
                    />
                </button>
            </div>

            {/* Search Bar for Mobile */}
            <div className="searchbar flex-grow mx-4 md:hidden mr-5 ml-0.5">
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Search for the product you're looking for" 
                    className="w-full border border-gray-300 rounded-md py-2 px-4"
                />
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
