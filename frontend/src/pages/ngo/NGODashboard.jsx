
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

function NGODashboard() {
  const [availableDonations, setAvailableDonations] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      const email = localStorage.getItem('foodconnectEmail')
      const role = localStorage.getItem('foodconnectRole')

      if (!email || role !== 'ngo') {
        setError('Please log in again using your NGO account.')
        setLoading(false)
        return
      }

      try {
        const [donationsResponse, requestsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/donations`),
          fetch(
            `${API_BASE_URL}/api/requests/ngo/${encodeURIComponent(
              email.trim().toLowerCase()
            )}`
          )
        ])

        if (!donationsResponse.ok || !requestsResponse.ok) {
          throw new Error('Unable to load dashboard data.')
        }

        const donationsData = await donationsResponse.json()
        const requestsData = await requestsResponse.json()

        setAvailableDonations(
          Array.isArray(donationsData)
            ? donationsData.filter(
                donation =>
                  donation.status?.toUpperCase() === 'AVAILABLE'
              )
            : []
        )

        setRequests(Array.isArray(requestsData) ? requestsData : [])
      } catch (err) {
        setError(err.message || 'Could not connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const acceptedRequests = requests.filter(
    request => request.status?.toUpperCase() === 'ACCEPTED'
  )

  const completedRequests = requests.filter(
    request => request.status?.toUpperCase() === 'COMPLETED'
  )

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="dashboard-logo">
          🍃 FoodConnect <span>AI</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/ngo/dashboard" className="active">
            🏠 Dashboard
          </Link>
          <Link to="/ngo/available-food">🍱 Available Food</Link>
          <Link to="/ngo/my-requests">📋 My Requests</Link>
          <Link to="/">🌐 Home</Link>
        </nav>

        <div className="sidebar-bottom">
          <Link
            to="/login"
            onClick={() => {
              localStorage.removeItem('foodconnectEmail')
              localStorage.removeItem('foodconnectRole')
            }}
          >
            🚪 Logout
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>Welcome, Organization! 🤝</h1>
            <p>
              Find available food donations and help communities in need.
            </p>
          </div>

          <div className="profile-circle">N</div>
        </div>

        {loading && <p>Loading dashboard...</p>}
        {error && <p className="request-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon">🍱</div>
                <div>
                  <p>Available Donations</p>
                  <h2>{availableDonations.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div>
                  <p>My Requests</p>
                  <h2>{requests.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🤝</div>
                <div>
                  <p>Accepted Requests</p>
                  <h2>{acceptedRequests.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div>
                  <p>Completed Requests</p>
                  <h2>{completedRequests.length}</h2>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-heading">
                <div>
                  <h2>Available Food Donations</h2>
                  <p>Food donations currently available for request</p>
                </div>

                <Link to="/ngo/available-food">View All</Link>
              </div>

              {availableDonations.length === 0 ? (
                <p>No food donations are currently available.</p>
              ) : (
                <div className="ngo-food-grid">
                  {availableDonations.slice(0, 3).map(donation => (
                    <div className="ngo-food-card" key={donation.id}>
                      <div className="ngo-food-top">
                        <div className="ngo-food-icon">🍱</div>
                        <span className="available-badge">Available</span>
                      </div>

                      <h3>{donation.foodName}</h3>
                      <p className="food-category">{donation.category}</p>

                      <div className="food-details">
                        <div>
                          <span>Quantity</span>
                          <strong>
                            {donation.quantity} {donation.quantityUnit}
                          </strong>
                        </div>
                      </div>

                      <div className="food-location">
                        📍 {donation.pickupLocation}
                      </div>

                      <div className="food-available">
                        🕒 Status: {donation.status}
                      </div>

                      <Link
                        to="/ngo/available-food"
                        className="request-food-btn"
                      >
                        Request Food
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ai-dashboard-card">
              <div className="ai-dashboard-icon">🤖</div>

              <div className="ai-dashboard-content">
                <h2>Need Help? Ask FoodConnect AI</h2>
                <p>
                  Get quick answers about food donations,
                  requesting food, and using the platform.
                </p>
              </div>

              <Link to="/ai-chat" className="ai-dashboard-btn">
                Ask AI
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default NGODashboard