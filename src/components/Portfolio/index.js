import { useEffect, useState, useRef  } from 'react'
import Loader from 'react-loaders'
import AnimatedLetters from '../AnimatedLetters'
import './index.scss'
import { getDocs, collection, addDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const Portfolio = () => {
  const [letterClass, setLetterClass] = useState('text-animate')
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
   const sliderRef = useRef(null)
   const [currentIndex, setCurrentIndex] = useState(0)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    details: '',
    image: '',
    tech: '',
    screenshots: '',
    url: '',
    github: '',
  })

  // Animate title letters
  useEffect(() => {
    const timer = setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch portfolio data
  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'portfolio'))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPortfolio(data)
    } catch (err) {
      console.error(err)
    }
  }

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // Add project
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addDoc(collection(db, 'portfolio'), {
        name: form.name,
        description: form.description,
        details: form.details,
        image: form.image,
        tech: form.tech.split(',').map((t) => t.trim()),
        screenshots: form.screenshots.split(',').map((url) => ({
          title: 'Screenshot',
          description: '',
          image: url.trim(),
        })),
        url: form.url,
        github: form.github,
        createdAt: new Date(),
      })

      setForm({
        name: '',
        description: '',
        details: '',
        image: '',
        tech: '',
        screenshots: '',
        url: '',
        github: '',
      })

      fetchPortfolio()
    } catch (err) {
      console.error('Error adding project:', err)
    }

    setLoading(false)
  }

  

  // Auto-slider for mobile only
  useEffect(() => {
    if (!sliderRef.current || portfolio.length === 0) return

    const isMobile = window.innerWidth <= 768
    if (!isMobile) return // only run on mobile

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1 >= portfolio.length ? 0 : prev + 1
        sliderRef.current.scrollTo({
          left: sliderRef.current.children[nextIndex].offsetLeft,
          behavior: 'smooth',
        })
        return nextIndex
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [portfolio])


  return (
    <>
      <div className="container portfolio-page">
        <h1 className="page-title">
          <AnimatedLetters
            letterClass={letterClass}
            strArray={'Portfolio'.split('')}
            idx={15}
          />
        </h1>

       <div className="form-toggle">
  <button
    type="button"
    className={`toggle-btn ${showForm ? "active" : ""}`}
    onClick={() => setShowForm((prev) => !prev)}
  >
    {showForm ? "Close Form" : "Add New Project"}
  </button>
</div>


        {/* ADD PROJECT FORM */}
        {showForm && (
        <form className="portfolio-form" onSubmit={handleSubmit}>
          <h2>Add New Project</h2>

          <input
            name="name"
            placeholder="Project Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="image"
            placeholder="Main Image URL"
            value={form.image}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Short Description"
            value={form.description}
            onChange={handleChange}
          />

          <textarea
            name="details"
            placeholder="Project Details"
            value={form.details}
            onChange={handleChange}
          />

          <input
            name="tech"
            placeholder="Tech (comma separated)"
            value={form.tech}
            onChange={handleChange}
          />

          <input
            name="screenshots"
            placeholder="Screenshot URLs (comma separated)"
            value={form.screenshots}
            onChange={handleChange}
          />

          <input
            name="url"
            placeholder="Live URL"
            value={form.url}
            onChange={handleChange}
          />

          <input
            name="github"
            placeholder="GitHub URL"
            value={form.github}
            onChange={handleChange}
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Project'}
          </button>
        </form>
        )}

        {/* PROJECT LIST */}
        <div className="images-container" ref={sliderRef}>
          {portfolio.map((port) => (
            <div className="image-box" key={port.id}>
              <img
                src={port.image}
                className="portfolio-image"
                alt={port.name}
              />

              <div className="content">
                <p className="title">{port.name}</p>
                <p className="description">{port.description}</p>

                {port.tech && (
                  <div className="tech">
                    {port.tech.map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                )}

                <div className="buttons">
                  {port.url && (
                    <button
                      className="btn"
                      onClick={() => window.open(port.url)}
                    >
                      Live
                    </button>
                  )}
                  {port.github && (
                    <button
                      className="btn secondary"
                      onClick={() => window.open(port.github)}
                    >
                      GitHub
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Loader type="pacman" />
    </>
  )
}

export default Portfolio
