import React, { useEffect, useState } from 'react';

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const saleEndDate = new Date("oct 20, 2024 23:59:59").getTime();
        const countdown = setInterval(() => {
            const now = new Date().getTime();
            const timeRemaining = saleEndDate - now;

            if (timeRemaining < 0) {
                clearInterval(countdown);
                setTimeLeft('Sale Ended');
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(countdown); // Cleanup interval on unmount
    }, []);

    return (
        <div className="text-center my-4">
            <h2 className="text-green-500">Exclusive Offers for Today</h2>
            <h3>Offer Ends In: <span className="font-bold text-red-500">{timeLeft}</span></h3>
        </div>
    );
};

export default Timer;
