import { useEffect, useState, useRef } from 'react'
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
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const velocity = useRef(0)
  const momentumID = useRef(null)
  const autoSlideInterval = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    const snapshot = await getDocs(collection(db, 'portfolio'))
    setPortfolio(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    await addDoc(collection(db, 'portfolio'), {
      ...form,
      tech: form.tech.split(',').map(t => t.trim()),
      screenshots: form.screenshots.split(',').map(url => ({
        title: 'Screenshot',
        image: url.trim(),
      })),
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
    setLoading(false)
  }

  /* =========================
     AUTO SLIDE
  ========================= */
  useEffect(() => {
    startAutoSlide()
    return stopAutoSlide
  }, [portfolio])

  const startAutoSlide = () => {
    stopAutoSlide()
    if (!sliderRef.current || portfolio.length === 0) return

    autoSlideInterval.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1 >= portfolio.length ? 0 : prev + 1
        sliderRef.current.scrollTo({
          left: sliderRef.current.children[next].offsetLeft,
          behavior: 'smooth',
        })
        return next
      })
    }, 4000)
  }

  const stopAutoSlide = () => {
    if (autoSlideInterval.current) clearInterval(autoSlideInterval.current)
  }

  /* =========================
     INERTIA DRAG SLIDER
  ========================= */
  const startDrag = clientX => {
    isDown.current = true
    startX.current = clientX - sliderRef.current.offsetLeft
    scrollLeft.current = sliderRef.current.scrollLeft
    velocity.current = 0
    sliderRef.current.classList.add('active')
    stopAutoSlide()
    if (momentumID.current) cancelAnimationFrame(momentumID.current)
  }

  const drag = clientX => {
    if (!isDown.current) return
    const x = clientX - sliderRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    velocity.current = sliderRef.current.scrollLeft - (scrollLeft.current - walk) // calculate velocity
    sliderRef.current.scrollLeft = scrollLeft.current - walk
  }

  const endDrag = () => {
    isDown.current = false
    sliderRef.current.classList.remove('active')
    startMomentum()
  }

  const startMomentum = () => {
    const decay = 0.95 // how fast it slows down (0.9 slower, 0.98 longer glide)
    const minVelocity = 0.5

    const step = () => {
      sliderRef.current.scrollLeft += velocity.current
      velocity.current *= decay

      if (Math.abs(velocity.current) > minVelocity) {
        momentumID.current = requestAnimationFrame(step)
      } else {
        cancelAnimationFrame(momentumID.current)
        startAutoSlide() // resume auto-slide
      }
    }

    momentumID.current = requestAnimationFrame(step)
  }

  const handleMouseDown = e => startDrag(e.pageX)
  const handleMouseMove = e => drag(e.pageX)
  const handleMouseUp = endDrag
  const handleMouseLeave = endDrag

  const handleTouchStart = e => startDrag(e.touches[0].pageX)
  const handleTouchMove = e => drag(e.touches[0].pageX)
  const handleTouchEnd = endDrag

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
            className={`toggle-btn ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close Form' : 'Add New Project'}
          </button>
        </div>

        {showForm && (
          <form className="portfolio-form" onSubmit={handleSubmit}>
            <h2>Add New Project</h2>
            {Object.keys(form).map(key => (
              <input
                key={key}
                name={key}
                placeholder={key.toUpperCase()}
                value={form[key]}
                onChange={handleChange}
              />
            ))}
            <button className="btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </form>
        )}

        <div className="slider-line" />

        <div
          className="images-container"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {portfolio.map(port => (
            <div className="image-box" key={port.id}>
              <img src={port.image} alt={port.name} className="portfolio-image" />

              <div className="content">
                <p className="title">{port.name}</p>
                <p className="description">{port.description}</p>

                <div className="buttons">
                  {port.url && (
                    <button onClick={() => window.open(port.url)}>Live</button>
                  )}
                  {port.github && (
                    <button
                      className="secondary"
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
