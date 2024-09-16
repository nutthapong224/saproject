// src/App.jsx

import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  About,
  Auth,
  Companies,
  Companyprofile,
  Findjobs,
  JobDetail,
  Uploadjob,
  UserProfile,
  NotFound,
  ForgotPassword,
  ResetPassword,
  ForgotPasswordCompany,
  ResetPasswordCompany,
  Editjob,
} from "./pages";

import { Footer, Navbar } from "./components";
import { useSelector } from "react-redux";

function Layout() {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/user-auth" state={{ from: location }} replace />
  );
}

function App() {
  const { user } = useSelector((state) => state.user);
  return (
    <main className="bg-[#f7fdfd]">
      <Navbar />

      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Navigate to="/find-jobs" replace={true} />}
          />
          <Route path="/find-jobs" element={<Findjobs />} />

          <Route path="/companies" element={<Companies />} />
          <Route
            path={
              user?.accountType === "seeker"
                ? "/user-profile"
                : "/user-profile/:id"
            }
            element={<UserProfile />}
          />

          <Route path={"/company-profile"} element={<Companyprofile />} />
          <Route path={"/company-profile/:id"} element={<Companyprofile />} />
          <Route path={"/upload-job"} element={<Uploadjob />} />
          <Route path={"/edit-job/:id"} element={<Editjob />} />
          <Route path={"/job-detail/:id"} element={<JobDetail />} />
        </Route>

        <Route path="/about-us" element={<About />} />
        <Route path="/user-auth" element={<Auth />} />
        <Route path="forgotPassword" element={<ForgotPassword />} />
        <Route path="resetPassword" element={<ResetPassword />} />
        <Route
          path="forgotPasswordCompany"
          element={<ForgotPasswordCompany />}
        />
        <Route path="resetPasswordCompany" element={<ResetPasswordCompany />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <Footer />}
    </main>
  );
}

export default App;
