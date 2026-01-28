import { createRoot } from "react-dom/client";
import "./index.css";
import LoginPage from "./features/auth/LoginPage.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import GroupsManagementPage from "./features/groups/GroupsManagementPage.jsx"
import ProfilePage from "./features/auth/ProfilePage.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NoteState from "./ContextApi/Notestate.jsx";
import AuthProtectedRoute from "./features/auth/components/AuthProtectedRoute.jsx";
import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <AuthProtectedRoute><Dashboard /></AuthProtectedRoute>,
  },
  {
    path:"/groupsFunctionality",
    element:<AuthProtectedRoute><GroupsManagementPage/></AuthProtectedRoute>
  },
  {
    path:"/userProfile",
    element:<AuthProtectedRoute><ProfilePage/></AuthProtectedRoute>
  }
]);

createRoot(document.getElementById("root")).render(

  <NoteState>
     <Toaster/>
    <RouterProvider router={router} />
  </NoteState>

);
