import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Button from './Button.jsx';
import Card from './Card.jsx';

function Restaurant() {
  //For user data and logout
  const { user, logout } = useAuth();
  //To navigate
  const navigate = useNavigate();
  
  // State for storing the restaurant data and loading status
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State to add new restaurant
  const [newRestaurantName, setNewRestaurantName] = useState('');

  const fetchRestaurants = () => {
    setIsLoading(true); // Set loading to true before fetching
    fetch('http://localhost:3001/restaurants')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch restaurants:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to handle adding a new restaurant
  const handleAddRestaurant = (event) => {
    event.preventDefault();

    fetch('http://localhost:3001/restaurants/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newRestaurantName }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert(data.message);
        setNewRestaurantName(''); // Clear the input field
        fetchRestaurants(); // Refresh the list from the server
      }
    })
    .catch(error => console.error("Error adding restaurant:", error));
  };

  // Display a loading message while waiting for the user data
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome, {user.username}! 🍔</h1>
      <p>Your registered email is: {user.email}</p>

      {/* NEW: Form for adding a restaurant */}
      <form onSubmit={handleAddRestaurant} style={{ margin: '30px 0' }}>
        <input
          type="text"
          value={newRestaurantName}
          onChange={(e) => setNewRestaurantName(e.target.value)}
          placeholder="Enter New Restaurant Name"
          required
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <Button type="submit">Add Restaurant</Button>
      </form>

      {isLoading ? (
        <p>Loading restaurants...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {restaurants.map(restaurant => (
            <Card key={restaurant.name} onClick={() => alert(`You`)}>
              {restaurant.name} ({restaurant.count})
            </Card>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '30px' }}>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

export default Restaurant;