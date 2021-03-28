const DevelopmentServerInfo = () => {
        return (
                <section className="hero is-small is-warning">
                        <div className="hero-body has-text-centered">
                                <p className="title">This is a development server</p>
                                <p>
                                        For the production version see
                                        <a className="button" href="https://2anki.net">https://2anki.net</a>
                                        <p>When reporting bugs, please make sure to share examples</p>
                                </p>
                        </div>
                </section>
        )
}

const UploadPage = () => {
        const isDevelopment = window.location.host !== "2anki.net"


        return (
                <div style={{paddingTop: "4rem"}}>
                        { isDevelopment ? <DevelopmentServerInfo /> : null}
                        <h2>Upload</h2>
                </div>
        )
}

export default UploadPage
