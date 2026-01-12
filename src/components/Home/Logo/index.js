import { useEffect, useRef } from 'react'
import gsap from 'gsap-trial'
import DrawSVGPlugin from 'gsap-trial/DrawSVGPlugin'
import LogoS from '../../../assets/images/logo-s.png'
import './index.scss'

const Logo = () => {
  const bgRef = useRef()
  const outlineLogoRef = useRef()
  const solidLogoRef = useRef()

  useEffect(() => {
    gsap.registerPlugin(DrawSVGPlugin)

    gsap
      .timeline()
      .to(bgRef.current, {
        duration: 1,
        opacity: 1,
      })
      .from(outlineLogoRef.current, {
        drawSVG: 0,
        duration: 20,
      })

    gsap.fromTo(
      solidLogoRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        delay: 4,
        duration: 4,
      }
    )
  }, [])

  return (
    <div className="logo-container" ref={bgRef}>
      <img
        className="solid-logo"
        ref={solidLogoRef}
        src={LogoS}
        alt="JavaScript,  Developer"
      />

      <svg
  width="300"
  height="300"
  viewBox="0 0 26000 14000"
  xmlns="http://www.w3.org/2000/svg"
>
  <g fill="none"
  transform="translate(0 14000) scale(1 -1)" >
    <path
      ref={outlineLogoRef}
      d="
        M 7500  0
        L 14000 21000
        L 20500  0
        M 15000 10000
        H 43000
      "
      stroke="#000"
      strokeWidth="600"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
</svg>
    </div>
  )
}

export default Logo


