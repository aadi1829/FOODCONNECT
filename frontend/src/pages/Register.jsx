
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: ''
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
      const response = await fetch(
        `${API_BASE_URL}/api/users/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      )

      const responseMessage = await response.text()

      if (!response.ok) {
        throw new Error(
          responseMessage || 'Registration failed. Please try again.'
        )
      }

      setIsSuccess(true)
      setMessage(responseMessage)

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        password: ''
      })
    } catch (error) {
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
      <div className="auth-card register-card">

        <div className="auth-logo">
          🍃 FoodConnect <span>AI</span>
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join FoodConnect AI and make a difference
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Register As</label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select your role</option>
              <option value="donor">Donor</option>
              <option value="ngo">NGO</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
          Already have an account?{' '}
          <Link to="/login">
            <span>Login</span>
          </Link>
        </p>

        <p className="auth-footer">
          <Link to="/">
            <span>← Back to Home</span>
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register