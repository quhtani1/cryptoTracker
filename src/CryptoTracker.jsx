import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CryptoTracker.css';

const CryptoTracker = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCrypto = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 10,
              page: 1,
              sparkline: false,
            },
          }
        );
        if (isMounted) {
          setCoins(res.data);
          setError(null);
        }
      } catch (err) {
        if (err.response && err.response.status === 429) {
          console.warn('Rate limit exceeded, slowing down requests.');
        } else {
          console.error('API fetch error:', err);
        }
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCrypto();

    const interval = setInterval(fetchCrypto, 30000); // every 30 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (error)
    return (
      <p className="loading error">
        Failed to load data. {error.response?.status === 429 ? 'Rate limit exceeded, please wait.' : ''}
      </p>
    );

  return (
    <div className="crypto-container">
      <h1>Top 10 Cryptocurrencies</h1>
      <div className="crypto-list">
        {coins.map((coin, index) => (
          <div
            key={coin.id}
            className="crypto-card"
            tabIndex={0}
            aria-label={`${coin.name} details`}
          >
            <div className="rank">{index + 1}</div>
            <img
              src={coin.image}
              alt={`${coin.name} logo`}
              className="coin-logo"
              width={48}
              height={48}
            />
            <div className="coin-info">
              <h2 className="coin-name">
                {coin.name}{' '}
                <span className="coin-symbol">({coin.symbol.toUpperCase()})</span>
              </h2>
              <p className="coin-price">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(coin.current_price)}
              </p>
            </div>
            <div
              className={`coin-change ${
                coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'
              }`}
            >
              {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTracker;
