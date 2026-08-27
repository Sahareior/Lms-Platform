import React from 'react'
import LandingHero from './_components/LandingHero'
import LandingFeatures from './_components/LandingFeatures'
import LandingPowerfulFeatures from './_components/LandingPowerfulFeatures'
import LandingCTA from './_components/LandingCTA'
import LandingFooter from './_components/LandingFooter'
import LandingNav from './_components/LandingNav'

const LandingPage = () => {
  return (
    <div>
        <LandingNav />
        <LandingHero />
        <LandingFeatures />
        {/* <LandingPowerfulFeatures /> */}
        <LandingCTA/>
        <LandingFooter />
    </div>
  )
}

export default LandingPage