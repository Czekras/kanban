import Header from './component/Header';
import Main from './component/Main';
// import Hidden from './component/Hidden';
import Footer from './component/Footer';

import './css/reset.css';
import './css/main.css';
import Setting from './component/Setting';
// import './css/main_sp.css';

function App() {
  return (
    <>
      <Header />
      <Main />
      {/* <Hidden /> */}
      <Setting />
      <Footer />
    </>
  );
}

export default App;