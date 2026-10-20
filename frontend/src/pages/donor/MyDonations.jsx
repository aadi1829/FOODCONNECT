import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

function MyDonations() {
  const [donations, setDonations] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [message, setMessage] = useState('')
  const [processingId, setProcessingId] = useState(null)

  async function loadDonations(email) {
    const response = await fetch(`${API_BASE_URL}/api/donations`)

    if (!response.ok) {
      throw new Error('Could not load donations from the server.')
    }

    const data = await response.json()

    const myDonations = data.filter((donation) => {
      const donorEmail =
        donation.donorEmail ??
        donation.email ??
        donation.donor?.email

      return donorEmail?.toLowerCase() === email.toLowerCase()
    })

    setDonations(myDonations)
  }

  async function loadRequests(email) {
    const response = await fetch(
      `${API_BASE_URL}/api/requests/donor/${encodeURIComponent(email)}`
    )

    if (!response.ok) {
      throw new Error('Could not load incoming NGO requests.')
    }

    const data = await response.json()
    setRequests(data)
  }

  async function refreshData(email) {
    setError('')
    setRequestError('')

    try {
      await loadDonations(email)
    } catch (err) {
      setError(err.message || 'Unable to load donations.')
    } finally {
      setLoading(false)
    }

    try {
      await loadRequests(email)
    } catch (err) {
      setRequestError(err.message || 'Unable to load NGO requests.')
    } finally {
      setRequestsLoading(false)
    }
  }

  useEffect(() => {
    const email = localStorage.getItem('foodconnectEmail')
    const role = localStorage.getItem('foodconnectRole')

    if (!email || role !== 'donor') {
      setError('Please log in again using your donor account.')
      setRequestError('Please log in again using your donor account.')
      setLoading(false)
      setRequestsLoading(false)
      return
    }

    refreshData(email)
  }, [])

  async function handleRequestAction(requestId, status) {
    const email = localStorage.getItem('foodconnectEmail')

    if (!email) {
      setRequestError('Please log in again using your donor account.')
      return
    }

    const action = status === 'ACCEPTED' ? 'accept' : 'reject'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this NGO request?`
    )

    if (!confirmed) return

    setProcessingId(requestId)
    setRequestError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/${requestId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            donorEmail: email,
            status
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not update the request.')
      }

      setMessage(result.message || `Request ${action}ed successfully.`)

      await refreshData(email)
    } catch (err) {
      setRequestError(err.message || 'Something went wrong.')
    } finally {
      setProcessingId(null)
    }
  }

  function getStatus(status) {
    const value = String(status || 'PENDING').toUpperCase()

    if (value === 'ACCEPTED') return 'Accepted'
    if (value === 'COMPLETED') return 'Completed'
    if (value === 'REJECTED') return 'Rejected'
    if (value === 'AVAILABLE') return 'Available'

    return 'Pending'
  }

  function formatDate(dateValue) {
    if (!dateValue) return '—'

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) return '—'

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  function getQuantity(donation) {
    const quantity = donation.quantity ?? '—'
    const unit = donation.quantityUnit ?? donation.unit ?? ''

    return `${quantity}${unit ? ` ${unit}` : ''}`
  }

  function statusStyle(status) {
    const value = String(status || 'PENDING').toUpperCase()

    if (value === 'ACCEPTED') {
      return {
        background: '#dcfce7',
        color: '#166534'
      }
    }

    if (value === 'REJECTED') {
      return {
        background: '#fee2e2',
        color: '#991b1b'
      }
    }

    return {
      background: '#fef3c7',
      color: '#92400e'
    }
  }

  const pendingCount = donations.filter(
    (donation) => getStatus(donation.status) === 'Pending'
  ).length

  const acceptedCount = donations.filter(
    (donation) => getStatus(donation.status) === 'Accepted'
  ).length

  const completedCount = donations.filter(
    (donation) => getStatus(donation.status) === 'Completed'
  ).length

  const pendingRequests = requests.filter(
    (request) => String(request.status).toUpperCase() === 'PENDING'
  ).length

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="dashboard-logo">
          🍃 FoodConnect <span>AI</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/donor/dashboard">🏠 Dashboard</Link>
          <Link to="/donor/donate">🍱 Donate Food</Link>
          <Link to="/donor/donations" className="active">
            📋 My Donations
          </Link>
          <Link to="/">🌐 Home</Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/login">🚪 Logout</Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>My Donations 📋</h1>
            <p>Track your donations and manage NGO requests.</p>
          </div>

          <div className="profile-circle">D</div>
        </div>

        <div className="donation-summary">
          <div className="summary-card">
            <span className="summary-icon">🍱</span>
            <div>
              <p>Total Donations</p>
              <h2>{donations.length}</h2>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">⏳</span>
            <div>
              <p>Pending</p>
              <h2>{pendingCount}</h2>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">🤝</span>
            <div>
              <p>Accepted</p>
              <h2>{acceptedCount}</h2>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">❤️</span>
            <div>
              <p>Completed</p>
              <h2>{completedCount}</h2>
            </div>
          </div>
        </div>

        {/* Incoming NGO Requests */}
        <section
          className="donations-table-card"
          style={{ marginBottom: '28px' }}
        >
          <div className="table-header">
            <div>
              <h2>🤝 Incoming NGO Requests</h2>
              <p>
                Review requests from NGOs and decide whether to accept them.
              </p>
            </div>

            <span
              style={{
                background: '#e0f2fe',
                color: '#075985',
                borderRadius: '20px',
                padding: '8px 14px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              {pendingRequests} Pending
            </span>
          </div>

          {message && (
            <div
              role="status"
              style={{
                margin: '16px 20px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#dcfce7',
                color: '#166534'
              }}
            >
              ✅ {message}
            </div>
          )}

          {requestError && (
            <div
              role="alert"
              style={{
                margin: '16px 20px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b'
              }}
            >
              {requestError}
            </div>
          )}

          {requestsLoading ? (
            <p style={{ padding: '20px' }}>Loading NGO requests...</p>
          ) : requests.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>
                📭
              </div>
              <h3>No NGO requests yet</h3>
              <p>
                Requests submitted for your food donations will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '18px',
                padding: '20px'
              }}
            >
              {requests.map((request) => {
                const status = String(request.status || 'PENDING').toUpperCase()
                const isPending = status === 'PENDING'
                const isProcessing = processingId === request.id

                return (
                  <article
                    key={request.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '14px',
                      padding: '20px',
                      background: '#ffffff',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                      minWidth: 0
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '16px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '28px' }}>🍱</div>
                        <h3 style={{ margin: '8px 0 4px' }}>
                          {request.foodName || 'Food donation'}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                          Request #{request.id}
                        </p>
                      </div>

                      <span
                        style={{
                          ...statusStyle(status),
                          padding: '6px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getStatus(status)}
                      </span>
                    </div>

                    <div style={{ lineHeight: '1.9', fontSize: '14px' }}>
                      <p style={{ margin: '4px 0' }}>
                        <strong>NGO email:</strong>
                        <br />
                        <span style={{ overflowWrap: 'anywhere' }}>
                          {request.ngoEmail}
                        </span>
                      </p>

                      <p style={{ margin: '8px 0' }}>
                        <strong>Category:</strong> {request.category || '—'}
                      </p>

                      <p style={{ margin: '8px 0' }}>
                        <strong>Quantity:</strong> {getQuantity(request)}
                      </p>

                      <p style={{ margin: '8px 0' }}>
                        <strong>Pickup location:</strong>
                        <br />
                        {request.pickupLocation || '—'}
                      </p>

                      <p style={{ margin: '8px 0' }}>
                        <strong>Request date:</strong>{' '}
                        {formatDate(request.createdAt)}
                      </p>
                    </div>

                    {isPending ? (
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: '18px'
                        }}
                      >
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleRequestAction(request.id, 'ACCEPTED')
                          }
                          style={{
                            flex: 1,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '11px 8px',
                            background: isProcessing ? '#9ca3af' : '#16a34a',
                            color: '#ffffff',
                            fontWeight: '600',
                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isProcessing ? 'Please wait...' : '✓ Accept'}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleRequestAction(request.id, 'REJECTED')
                          }
                          style={{
                            flex: 1,
                            border: '1px solid #dc2626',
                            borderRadius: '8px',
                            padding: '11px 8px',
                            background: '#ffffff',
                            color: '#dc2626',
                            fontWeight: '600',
                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <p
                        style={{
                          marginTop: '18px',
                          padding: '10px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          color: '#475569',
                          fontSize: '13px',
                          textAlign: 'center'
                        }}
                      >
                        This request has been processed.
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Existing Donation History */}
        <div className="donations-table-card">
          <div className="table-header">
            <div>
              <h2>Donation History</h2>
              <p>Your recently submitted food donations</p>
            </div>

            <Link to="/donor/donate" className="new-donation-btn">
              + New Donation
            </Link>
          </div>

          {loading ? (
            <p style={{ padding: '20px' }}>Loading your donations...</p>
          ) : error ? (
            <p style={{ padding: '20px', color: 'crimson' }}>{error}</p>
          ) : donations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <h3>No donations found</h3>
              <p>Your donations will appear here after they are submitted.</p>
              <Link to="/donor/donate" className="new-donation-btn">
                Donate Food
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>People Served</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {donations.map((donation) => {
                    const status = getStatus(donation.status)

                    return (
                      <tr key={donation.id}>
                        <td>
                          <div className="food-name">
                            <span className="food-small-icon">🍱</span>
                            <strong>
                              {donation.foodName ?? donation.food ?? 'Food donation'}
                            </strong>
                          </div>
                        </td>

                        <td>{donation.category ?? '—'}</td>
                        <td>{getQuantity(donation)}</td>
                        <td>
                          {donation.peopleServed ?? donation.people ?? '—'}
                        </td>
                        <td>
                          {formatDate(
                            donation.createdAt ??
                            donation.donationDate ??
                            donation.date
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MyDonations