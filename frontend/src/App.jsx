
import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import AIChat from './pages/AIChat'

import Login from './pages/Login'
import Register from './pages/Register'
import DonorDashboard from './pages/donor/DonorDashboard'
import DonateFood from './pages/donor/DonateFood'
import MyDonations from './pages/donor/MyDonations'
import NGODashboard from './pages/ngo/NGODashboard'
import AvailableFood from './pages/ngo/AvailableFood'
import MyRequests from './pages/ngo/MyRequests'

// =========================
// HOME PAGE
// =========================

function Home() {
  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🍃</span>
          <span>
            FoodConnect <strong>AI</strong>
          </span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
        </nav>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Register
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-small-text">
            🍴 Reduce Food Waste • Help Communities
          </p>

          <h1>
            Connecting Surplus
            <br />
            Food
            <br />
            With Those In Need
          </h1>

          <p className="hero-description">
            FoodConnect AI helps donors, NGOs and volunteers
            work together to reduce food waste and make sure
            surplus food reaches people who need it.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Donate Food
            </Link>

            <Link to="/register" className="secondary-btn">
              Find Food
            </Link>
          </div>
        </div>

        {/* FOOD ILLUSTRATION */}
        <div className="hero-image">
          <div className="food-circle">🍲</div>

          <div className="food-card">
            <h3>Make a Difference</h3>
            <p>One donation can help someone in need.</p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">
        <p className="section-label">ABOUT FOODCONNECT AI</p>

        <h2>
          Turning Extra Food Into
          <br />
          Meaningful Connections
        </h2>

        <p className="section-description">
          Every day, perfectly good food goes to waste while
          many people struggle to get enough food. FoodConnect
          AI creates a simple platform where surplus food can
          be connected with NGOs and communities.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <p className="section-label">HOW IT WORKS</p>
        <h2>Simple Steps. Real Impact.</h2>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">🍱</div>
            <h3>1. Donate</h3>
            <p>Donors add details about their surplus food.</p>
          </div>

          <div className="step-card">
            <div className="step-icon">🤝</div>
            <h3>2. Connect</h3>
            <p>NGOs can find available food donations.</p>
          </div>

          <div className="step-card">
            <div className="step-icon">🚚</div>
            <h3>3. Deliver</h3>
            <p>Volunteers help coordinate pickup and delivery.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <p className="section-label">FEATURES</p>
        <h2>Everything In One Place</h2>

        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h3>Food Donations</h3>
            <p>Easily create and manage food donations.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>NGO Connections</h3>
            <p>
              Connect available food with organizations
              that need it.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>
              Get quick help and guidance using the
              FoodConnect AI assistant.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Donation Tracking</h3>
            <p>
              Track donations from creation to successful
              delivery.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <h2>Ready to Make a Difference?</h2>

        <p>
          Join FoodConnect AI and help reduce food waste
          in your community.
        </p>

        <Link to="/register" className="primary-btn">
          Get Started
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="logo">
          <span className="logo-icon">🍃</span>
          <span>
            FoodConnect <strong>AI</strong>
          </span>
        </div>

        <p>Connecting surplus food with those in need.</p>

        <p className="copyright">
          © 2026 FoodConnect AI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

// =========================
// MAIN APP / ROUTES
// =========================

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* DONOR ROUTES */}
      <Route
        path="/donor/dashboard"
        element={<DonorDashboard />}
      />

      <Route
        path="/donor/donate"
        element={<DonateFood />}
      />

      <Route
        path="/donor/donations"
        element={<MyDonations />}
      />

      {/* NGO ROUTES */}
      <Route
        path="/ngo/dashboard"
        element={<NGODashboard />}
      />

      <Route
        path="/ngo/available-food"
        element={<AvailableFood />}
      />

      {/* Correct My Requests route */}
      <Route
        path="/ngo/my-requests"
        element={<MyRequests />}
      />

      {/* Keep the older URL working too */}
      <Route
        path="/ngo/requests"
        element={<MyRequests />}
      />
      <Route path="/ai-chat" element={<AIChat />} />
    </Routes>
    
  )
}

export default App
