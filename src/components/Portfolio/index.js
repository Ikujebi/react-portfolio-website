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

  /* AUTO SLIDE */
  useEffect(() => {
    if (!sliderRef.current || portfolio.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1 >= portfolio.length ? 0 : prev + 1
        sliderRef.current.scrollTo({
          left: sliderRef.current.children[next].offsetLeft,
          behavior: 'smooth',
        })
        return next
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [portfolio])

  /* DRAG */
  const handleMouseDown = e => {
    isDown.current = true
    startX.current = e.pageX - sliderRef.current.offsetLeft
    scrollLeft.current = sliderRef.current.scrollLeft
  }

  const handleMouseUp = () => (isDown.current = false)
  const handleMouseLeave = () => (isDown.current = false)

  const handleMouseMove = e => {
    if (!isDown.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    sliderRef.current.scrollLeft = scrollLeft.current - walk
  }

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
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {portfolio.map(port => (
            <div className="image-box" key={port.id}>
              <img src={port.image} alt={port.name} />

              <div className="content">
                <p className="title">{port.name}</p>
                <p className="description">{port.description}</p>

                <div className="buttons">
                  {port.url && (
                    <button onClick={() => window.open(port.url)}>
                      Live
                    </button>
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
