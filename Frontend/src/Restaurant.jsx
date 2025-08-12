import Modal from "react-modal";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Button from './Button.jsx';
import Card from './Card.jsx';

Modal.setAppElement('#root');
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
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [restaurantName, setRestaurantName] = useState(null);
  const [isOpenRestaurant, setIsOpenRestaurant] = useState(false);
  const [restaurantUsers, setRestaurantUsers] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(0);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userFetchError, setUserFetchError] = useState(null);

  const [addUser,setAddUser] = useState(null);
  const [isCurrentUserMember, setIsCurrentUserMember] = useState(false);

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

    const fetchInterestedUsers = (restaurantId) => {
    setIsUsersLoading(true); // Show loading indicator for users
    setUserFetchError(null); // Clear previous errors

    fetch(`http://localhost:3001/restaurants/${restaurantId}/users`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setRestaurantUsers(data);
        setIsUsersLoading(false);
        const isMember = user && data.some(u => u.username === user.username);
        setIsCurrentUserMember(isMember);
      })
      .catch(error => {
        console.error(`Failed to fetch users for restaurant ${restaurantId}:`, error);
        setUserFetchError("Failed to load user details. Please try again."); // Set user-friendly error message
        setRestaurantUsers([]); // Clear users on error
        setIsUsersLoading(false);
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

  const handleRestaurantClick = (restaurant) => {
    setRestaurantName(restaurant.name);
    setRestaurantCount(restaurant.count);
    setSelectedRestaurantId(restaurant.id);
    setIsOpenRestaurant(true);
    fetchInterestedUsers(restaurant.id);
  }

  const handleAddCurrentUserToRestaurant = () => {
    if (!user || !user.id || !selectedRestaurantId) { // Check for user.id as well
      console.error("User not logged in, user ID not available, or restaurant not selected.");
      alert("Error: Please log in and select a restaurant."); // Use a custom modal in a real app
      return;
    }

    fetch(`http://localhost:3001/restaurants/${selectedRestaurantId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }), // Send the current user's ID
    })
    .then(res => res.json())
    .then(data => {
      // Use a custom modal/message box in a real app instead of alert
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert(data.message);
        // Refresh both restaurant list (to update count) and interested users in modal
        fetchRestaurants(); // This will update the count on the main page
        fetchInterestedUsers(selectedRestaurantId); // This will update the list in the modal
      }
    })
    .catch(error => {
      console.error("Error joining restaurant:", error);
      alert("An error occurred while trying to join the restaurant."); // Use a custom modal in a real app
    });
  };

    const handleLeaveRestaurant = () => {
    if (!user || !user.id || !selectedRestaurantId) {
      console.error("User not logged in, user ID not available, or restaurant not selected.");
      alert("Error: Please log in and select a restaurant to leave.");
      return;
    }

    // Using DELETE method, but sending userId in body (common for DELETE with payload)
    fetch(`http://localhost:3001/restaurants/${selectedRestaurantId}/leave`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }), // Send the current user's ID
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert(data.message);
        // Refresh both restaurant list and interested users
        fetchRestaurants();
        fetchInterestedUsers(selectedRestaurantId);
      }
    })
    .catch(error => {
      console.error("Error leaving restaurant:", error);
      alert("An error occurred while trying to leave the restaurant.");
    });
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
            <Card key={restaurant.name} onClick={() => handleRestaurantClick(restaurant)}>
              {restaurant.name} ({restaurant.count})
            </Card>
          ))}
          <Modal isOpen={isOpenRestaurant} onRequestClose={() => setIsOpenRestaurant(false)} className="modal-content" overlayClassName="modal-overlay">
            <h2>{restaurantName}</h2>
              {isUsersLoading ? (
                        <p >Loading interested users...</p>
                      ) : userFetchError ? (
                        <p >{userFetchError}</p>
                      ) : restaurantUsers.length === 0 ? (
                        <p >No users have shown interest in this restaurant yet.</p>
                      ) : (
                        <div >
                          <table >
                            <thead >
                              <tr>
                                <th>No.</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                              </tr>
                            </thead>
                            <tbody >
                              {restaurantUsers.map((user, index) => (
                                <tr key={user.email}>
                                  <td>{index + 1}</td>
                                  <td>{user.username}</td>
                                  <td >{user.email}</td>
                                  <td>{user.phonenumber}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td >Total Users Interested:</td>
                                <td >{restaurantUsers.length}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                      {isCurrentUserMember ? (
                        <p className="text-green-600 text-center font-medium my-4">You have already shown interest in this restaurant!</p>
                          ) : (
                            <Button
                              onClick={handleAddCurrentUserToRestaurant}
                              className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md transition duration-200"
                            >
                              Join this Restaurant
                            </Button>
                          )}
                      {isCurrentUserMember && (
                            <Button
                              onClick={handleLeaveRestaurant}
                              className="mt-4 ml-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-md transition duration-200"
                            >
                              Leave Group
                            </Button>
                            )}
            <Button onClick={() => setIsOpenRestaurant(false)}>Close</Button>
          </Modal>
        </ul>
      )}

      <div style={{ marginTop: '30px' }}>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

export default Restaurant;