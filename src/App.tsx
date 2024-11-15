import CardLab from "./components/CardLab";
import "./App.css";
import { ConfigContextProvider } from "./types/config";

function App() {
  return (
    <ConfigContextProvider>
      <CardLab />
    </ConfigContextProvider>
  );
}

export default App;
