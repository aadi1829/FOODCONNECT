
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const loadRequests = useCallback(async (ngoEmail) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/ngo/${encodeURIComponent(
          ngoEmail.trim().toLowerCase()
        )}`
      )

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      console.error('Error loading NGO requests:', err)
      setError(err.message || 'Could not connect to the backend.')
    }
  }, [])

  useEffect(() => {
    const savedEmail = localStorage.getItem('foodconnectEmail')

    if (!savedEmail) {
      setEmail('')
      setError('Please log in again using your NGO account.')
      setLoading(false)
      return
    }

    setEmail(savedEmail.trim().toLowerCase())

    const role = localStorage.getItem('foodconnectRole')
    if (role && role.toLowerCase() !== 'ngo') {
      setError('Please log in using your NGO account.')
      setLoading(false)
      return
    }

    loadRequests(savedEmail).finally(() => setLoading(false))
  }, [loadRequests])

  async function updateStatus(request, newStatus) {
    if (processingId !== null) return

    const action =
      newStatus === 'PICKED_UP' ? 'mark this food as picked up' : 'mark this donation as completed'

    if (!window.confirm(`Are you sure you want to ${action}?`)) {
      return
    }

    setProcessingId(request.id)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/${request.id}/ngo-status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ngoEmail: email,
            status: newStatus,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`)
      }

      setMessage(result.message || 'Request status updated successfully.')
      await loadRequests(email)
    } catch (err) {
      console.error('Error updating request status:', err)
      setError(err.message || 'Could not update the request.')
    } finally {
      setProcessingId(null)
    }
  }

  function statusColor(status) {
    switch ((status || '').toUpperCase()) {
      case 'ACCEPTED':
        return '#18794e'
      case 'PICKED_UP':
        return '#2458a6'
      case 'COMPLETED':
        return '#18794e'
      case 'REJECTED':
        return '#b42318'
      case 'PENDING':
        return '#946200'
      default:
        return '#555'
    }
  }

  function readableStatus(status) {
    return (status || 'PENDING')
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  return (
    <div className="available-food-container">
      <h2>My Requests</h2>
      <p>Track the food donations requested by your organization.</p>

      <p>
        <strong>Signed-in email:</strong> {email || 'No email saved'}
      </p>

      {loading && <p>Loading your requests...</p>}

      {message && (
        <p className="request-message" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="request-message" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && requests.length === 0 && (
        <p>
          No requests found for this account. Check that the signed-in email
          matches your NGO account.
        </p>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="food-list">
          {requests.map((request) => {
            const status = (request.status || 'PENDING').toUpperCase()
            const isProcessing = processingId === request.id

            return (
              <div className="food-card" key={request.id}>
                <h3>{request.foodName || `Request #${request.id}`}</h3>

                <p><strong>Request ID:</strong> {request.id}</p>
                <p><strong>Donation ID:</strong> {request.donationId}</p>
                <p><strong>Category:</strong> {request.category || 'Not available'}</p>
                <p>
                  <strong>Quantity:</strong> {request.quantity ?? 'Not available'}{' '}
                  {request.quantityUnit || ''}
                </p>
                <p>
                  <strong>Pickup Location:</strong>{' '}
                  {request.pickupLocation || 'Not available'}
                </p>
                <p>
                  <strong>Description:</strong>{' '}
                  {request.description || 'No description provided'}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      color: statusColor(status),
                      fontWeight: 'bold',
                    }}
                  >
                    {readableStatus(status)}
                  </span>
                </p>

                <p>
                  <strong>Requested on:</strong>{' '}
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleString()
                    : 'Date unavailable'}
                </p>

                {status === 'ACCEPTED' && (
                  <button
                    type="button"
                    disabled={processingId !== null}
                    onClick={() => updateStatus(request, 'PICKED_UP')}
                  >
                    {isProcessing ? 'Updating...' : 'Mark Picked Up'}
                  </button>
                )}

                {status === 'PICKED_UP' && (
                  <button
                    type="button"
                    disabled={processingId !== null}
                    onClick={() => updateStatus(request, 'COMPLETED')}
                  >
                    {isProcessing ? 'Updating...' : 'Mark Completed'}
                  </button>
                )}

                {status === 'COMPLETED' && (
                  <p><strong>Donation completed successfully!</strong></p>
                )}

                {status === 'PENDING' && (
                  <p>Waiting for the donor to approve this request.</p>
                )}

                {status === 'REJECTED' && (
                  <p>This request was rejected by the donor.</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p>
        <Link to="/ngo/dashboard">Back to NGO Dashboard</Link>
      </p>
    </div>
  )
}

export default MyRequests