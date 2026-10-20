
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
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
        `${API_BASE_URL}/api/users/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Invalid email or password.'
        )
      }

      const roleRoutes = {
        donor: '/donor/dashboard',
        ngo: '/ngo/dashboard',
        volunteer: '/'
      }

      const role = result.role?.toLowerCase()
      const destination = roleRoutes[role]

      if (!destination || !result.email) {
        throw new Error(
          'Login response is missing the email or a supported role.'
        )
      }

      // Save the logged-in user's details for the application.
      localStorage.setItem(
        'foodconnectEmail',
        result.email.trim().toLowerCase()
      )

      localStorage.setItem('foodconnectRole', role)

      setIsSuccess(true)
      setMessage(result.message || 'Login successful!')

      navigate(destination)
    } catch (error) {
      console.error('Login error:', error)

      setIsSuccess(false)

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
      <div className="auth-card">

        <div className="auth-logo">
          🍃 FoodConnect <span>AI</span>
        </div>

        <h1>Welcome Back!</h1>

        <p className="auth-subtitle">
          Login to continue to FoodConnect AI
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
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
          Don't have an account?{' '}
          <Link to="/register">
            <span>Register</span>
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

export default Login