
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

function DonorDashboard() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDonations() {
      const email = localStorage.getItem('foodconnectEmail')
      const role = localStorage.getItem('foodconnectRole')

      if (!email || role !== 'donor') {
        setError('Please log in again using your donor account.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/donations`
        )

        if (!response.ok) {
          throw new Error('Unable to load donations.')
        }

        const data = await response.json()

        const myDonations = Array.isArray(data)
          ? data.filter(
              donation =>
                donation.donorEmail?.trim().toLowerCase() ===
                email.trim().toLowerCase()
            )
          : []

        setDonations(myDonations)
      } catch (err) {
        setError(err.message || 'Could not connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadDonations()
  }, [])

  const countStatus = status =>
    donations.filter(
      donation => donation.status?.toUpperCase() === status
    ).length

  const pendingCount = countStatus('PENDING')
  const acceptedCount = countStatus('ACCEPTED')
  const completedCount = countStatus('COMPLETED')

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="dashboard-logo">
          🍃 FoodConnect <span>AI</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/donor/dashboard" className="active">
            🏠 Dashboard
          </Link>
          <Link to="/donor/donate">🍱 Donate Food</Link>
          <Link to="/donor/donations">📋 My Donations</Link>
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
            <h1>Welcome, Donor! 👋</h1>
            <p>Manage your food donations and make a difference.</p>
          </div>
          <div className="profile-circle">D</div>
        </div>

        {loading && <p>Loading your donations...</p>}

        {error && <p className="request-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon">🍱</div>
                <div>
                  <p>Total Donations</p>
                  <h2>{donations.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div>
                  <p>Pending</p>
                  <h2>{pendingCount}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🤝</div>
                <div>
                  <p>Accepted</p>
                  <h2>{acceptedCount}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div>
                  <p>Completed</p>
                  <h2>{completedCount}</h2>
                </div>
              </div>
            </div>

            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <h2>Quick Actions</h2>
                  <p>What would you like to do?</p>
                </div>
              </div>

              <div className="quick-actions">
                <Link to="/donor/donate" className="action-card">
                  <div className="action-icon">🍱</div>
                  <h3>Donate Food</h3>
                  <p>Create a new food donation</p>
                </Link>

                <Link to="/donor/donations" className="action-card">
                  <div className="action-icon">📋</div>
                  <h3>My Donations</h3>
                  <p>View and track your donations</p>
                </Link>

                <Link to="/ai-chat" className="action-card">
                  <div className="action-icon">🤖</div>
                  <h3>AI Assistant</h3>
                  <p>Ask FoodConnect AI about donations and requests</p>
                </Link>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <h2>Recent Donations</h2>
                  <p>Your latest food donations</p>
                </div>
                <Link to="/donor/donations">View All →</Link>
              </div>

              {donations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🍽️</div>
                  <h3>No donations yet</h3>
                  <p>Your food donations will appear here.</p>
                  <Link to="/donor/donate" className="primary-btn">
                    Donate Food
                  </Link>
                </div>
              ) : (
                <div className="ngo-food-grid">
                  {donations.slice(0, 3).map(donation => (
                    <div className="ngo-food-card" key={donation.id}>
                      <div className="ngo-food-top">
                        <div className="ngo-food-icon">🍱</div>
                        <span className="available-badge">
                          {donation.status || 'Available'}
                        </span>
                      </div>

                      <h3>{donation.foodName}</h3>
                      <p className="food-category">
                        {donation.category}
                      </p>

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
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default DonorDashboard