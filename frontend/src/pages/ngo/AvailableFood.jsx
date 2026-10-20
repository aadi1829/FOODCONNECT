import './AvailableFood.css'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './AvailableFood.css'
import { API_BASE_URL } from '../../config'

function AvailableFood() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [requestedIds, setRequestedIds] = useState([])
  const [requestingId, setRequestingId] = useState(null)

  // Load real food donations from the backend
  useEffect(() => {
    async function loadDonations() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/donations`
        )

        if (!response.ok) {
          throw new Error('Could not load food donations.')
        }

        const data = await response.json()

        // Show only donations that are available
        setDonations(
          data.filter(
            donation =>
              donation.status?.toUpperCase() === 'AVAILABLE'
          )
        )
      } catch (error) {
        setMessage(
          'Could not connect to the backend. Please check that it is running.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDonations()
  }, [])

  // Save the NGO's request in the backend database
  async function handleRequest(donation) {
    setMessage('')

    const ngoEmail = localStorage.getItem('foodconnectEmail')
    const role = localStorage.getItem('foodconnectRole')

    if (!ngoEmail || role !== 'ngo') {
      setMessage('Please log out and log in again using your NGO account.')
      return
    }

    if (requestedIds.includes(donation.id)) {
      setMessage('You have already requested this donation.')
      return
    }

    setRequestingId(donation.id)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            donationId: donation.id,
            ngoEmail: ngoEmail
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Could not submit the request.'
        )
      }

      setRequestedIds(previous => [...previous, donation.id])
      setMessage(
        `Success! Your request was saved. Request ID: ${result.requestId}`
      )
    } catch (error) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setRequestingId(null)
    }
  }

  if (loading) {
    return <div className="available-food-container">
      <h2>Available Food</h2>
      <p>Loading available donations...</p>
    </div>
  }

  return (
    <div className="available-food-container">
      <h2>Available Food</h2>
      <p>Find food donations available for your organization.</p>

      {message && (
        <p role="status" className="request-message">
          {message}
        </p>
      )}

      {donations.length === 0 ? (
        <p>No available food donations found right now.</p>
      ) : (
        <div className="food-list">
          {donations.map(donation => {
            const requested = requestedIds.includes(donation.id)

            return (
              <div className="food-card" key={donation.id}>
                <h3>{donation.foodName}</h3>

                <p>
                  <strong>Category:</strong>{' '}
                  {donation.category}
                </p>

                <p>
                  <strong>Quantity:</strong>{' '}
                  {donation.quantity} {donation.quantityUnit}
                </p>

                <p>
                  <strong>Pickup Location:</strong>{' '}
                  {donation.pickupLocation}
                </p>

                {donation.description && (
                  <p>
                    <strong>Description:</strong>{' '}
                    {donation.description}
                  </p>
                )}

                <button
                  type="button"
                  className="request-food-btn"
                  onClick={() => handleRequest(donation)}
                  disabled={requested || requestingId === donation.id}
                >
                  {requestingId === donation.id
                    ? 'Submitting...'
                    : requested
                      ? 'Request Submitted'
                      : 'Request Food'}
                </button>
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

export default AvailableFood