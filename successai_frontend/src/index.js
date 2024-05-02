import ReactDOM from "react-dom/client";
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { App } from "./app";
import "./styles.css";
import { Provider } from "react-redux";
import { store } from "./store.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render( 
  <HelmetProvider>
    <Provider store={store}>
      <BrowserRouter>
        <Suspense>
          <App />
        </Suspense>
      </BrowserRouter>
    </Provider>
  </HelmetProvider>
);
