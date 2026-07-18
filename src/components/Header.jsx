import './Header.css'

/**
 * App header. The version tag reads from the build-time global __APP_VERSION__,
 * which Vite injects from package.json (see vite.config.js). Never hardcode it.
 */
export default function Header({ title }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <h1 className="app-header__title">
          {title}
          <span className="app-header__version">v{__APP_VERSION__}</span>
        </h1>
      </div>
    </header>
  )
}
