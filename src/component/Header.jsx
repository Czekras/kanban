export default function Header() {
  const currentPage = window.location.href;

  return (
    <header className="header">
      <div className="header__wrapper">
        <a className="header__logo" href={currentPage}>
          <h1 className="header__title">kanban</h1>
        </a>
      </div>
    </header>
  );
}
