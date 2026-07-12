import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import RightSidebar from "./components/RightSidebar";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Header />
      <Navbar />

      <div className="main-content">
        <Home />
      </div>

      <RightSidebar />
    </>
  );
}

export default App;