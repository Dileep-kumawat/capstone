import { createBrowserRouter } from "react-router";
import App from "./App";
import TokenRoute from "./components/TokenRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },{
    path: "/auth/callback/",
    element: <TokenRoute />
  }
]);