import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// DevTools lock removed for development

createRoot(document.getElementById("root")!).render(<App />);
