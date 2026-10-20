
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

function DonateFood() {
  const [formData, setFormData] = useState({
    foodName: '',
    category: '',
    quantity: '',
    quantityUnit: 'servings',
    preparationDate: '',
    pickupLocation: '',
    description: '',
    donorEmail: ''
  })

  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSuccess(false)
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          donorEmail: formData.donorEmail.trim().toLowerCase()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not submit the donation.')
      }

      setIsSuccess(true)
      setMessage(`${result.message} Donation ID: ${result.id}`)

      setFormData({
        foodName: '',
        category: '',
        quantity: '',
        quantityUnit: 'servings',
        preparationDate: '',
        pickupLocation: '',
        description: '',
        donorEmail: ''
      })
    } catch (error) {
      console.error('Donation error:', error)

      setMessage(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Please check that it is running.'
          : error.message
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card donation-card">
        <div className="auth-logo">
          🍃 FoodConnect <span>AI</span>
        </div>

        <h1>Donate Food</h1>

        <p className="auth-subtitle">
          Share surplus food and help someone in need.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="foodName">Food Name</label>
            <input
              id="foodName"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              placeholder="e.g. Vegetable rice"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Food Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="Cooked Food">Cooked Food</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Bakery">Bakery</option>
              <option value="Packaged Food">Packaged Food</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 20"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantityUnit">Quantity Unit</label>
            <select
              id="quantityUnit"
              name="quantityUnit"
              value={formData.quantityUnit}
              onChange={handleChange}
              required
            >
              <option value="servings">Servings</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="packets">Packets</option>
              <option value="boxes">Boxes</option>
              <option value="items">Items</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="preparationDate">
              Preparation Date (optional)
            </label>
            <input
              id="preparationDate"
              name="preparationDate"
              type="date"
              value={formData.preparationDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pickupLocation">Pickup Location</label>
            <input
              id="pickupLocation"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="Enter pickup address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="donorEmail">Your Registered Email</label>
            <input
              id="donorEmail"
              name="donorEmail"
              type="email"
              value={formData.donorEmail}
              onChange={handleChange}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Additional Details (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about the food"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Donation'}
          </button>

          {message && (
            <p
              role="status"
              style={{
                color: isSuccess ? 'green' : 'crimson',
                marginTop: '12px'
              }}
            >
              {message}
            </p>
          )}
        </form>

        <p className="auth-footer">
          <Link to="/donor/dashboard">← Back to Dashboard</Link>
        </p>
      </div>
    </div>
  )
}

export default DonateFood