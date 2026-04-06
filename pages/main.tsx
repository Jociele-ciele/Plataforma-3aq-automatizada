import {strictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";}
import App from "./App";
import{AuthProvider } from "./auth/Context";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <strictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </strictMode>,
);