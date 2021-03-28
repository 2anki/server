import styled from "styled-components"

import CTAButton from "../components/CTAButton"

const MascotImage = styled.img`
height: 500px;
object-fit: contain;
`

const HomePage = () => {

	const index = Math.round(Math.random() * 4)
        const image = `mascot/Notion ${index + 1}.png`

        return (
                <>
                        <h2>Home</h2>
                        <section className="hero is-large">
                                <div className="hero-body">
                                        <div className="container">
                                                <div className="has-text-centered">
                                                        <MascotImage src={image} alt="Notion to Anki Mascot" loading="lazy" />
                                                        <h1 className="title is-size-1">Convert Notion  to Anki Flashcards ✨</h1>
							<p className="subtitle is-size-2">We are making it the easiest and fastest way to create beautiful  Anki flashcards for anyone anywhere around the world 🌎</p>
                                                        <CTAButton isLarge destination="/upload" text="Get Started"/>
							<p>Fast, simple, easy and 100% <span style={{fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'green'}}>"Free"</span>. It's a passion project 🕺🏾💃🏾</p>
                                                </div>
                                        </div>
                                </div>
                        </section>
                </>
        )
}

export default HomePage
