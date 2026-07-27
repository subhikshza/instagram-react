import Feed from "../components/Feed";
import Suggestions from "../components/Suggestions";

export default function Home() {
  return (
    <div className="app-layout">
      <main className="main-column">
        <Feed />
      </main>

      <Suggestions />
    </div>
  );
}