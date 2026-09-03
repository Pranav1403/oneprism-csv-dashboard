import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/layout/Layout";

import DashboardPage from "./pages/DashboardPage";
import ImportDetailsPage from "./pages/ImportDetailsPage";


function App() {
  return (
    <BrowserRouter>

      <Layout>

        <Routes>

          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/imports/:jobId"
            element={
              <ImportDetailsPage />
            }
          />

        </Routes>

      </Layout>

    </BrowserRouter>
  );
}


export default App;