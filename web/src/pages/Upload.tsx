import {Link, useLocation} from "react-router-dom"

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

// A custom hook that builds on useLocation to parse
// the query string for you. 
// Reference: https://reactrouter.com/web/example/query-parameters
function useQuery() {
        return new URLSearchParams(useLocation().search);
      }

const UploadPage = () => {
        const isDevelopment = window.location.host !== "2anki.net"
        const query = useQuery()
        const view = query.get("view")

        return (
                <div style={{paddingTop: "4rem"}}>
                        { isDevelopment ? <DevelopmentServerInfo /> : null}
                        <div className="tabs is-centered is-boxed">
                                <ul>
                                        <li  className={`${view === 'upload' ? 'is-active' : null}`}> <Link to="upload?view=upload">Upload</Link></li>
                                        <li  className={`${view === 'template' ? 'is-active' : null}`} ><Link to="upload?view=template">Template</Link></li>
                                        <li  className={`${view === 'deck-options' ? 'is-active' : null}`} ><Link to="upload?view=deck-options">Deck</Link></li>
                                        <li  className={`${view === 'card-options' ? 'is-active' : null}`} ><Link to="upload?view=card-options">Card</Link></li>
                                </ul>
                        </div>
                </div>
        )
}

export default UploadPage
