import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Composants chargés immédiatement (critiques)
import NotFound from "../pages/NotFound";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Pages publiques - Lazy load
const Register = lazy(() => import("../pages/Auth/Register"));
const Login = lazy(() => import("../pages/Auth/Login"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));

// Pages Employé - Lazy load
const UserDashboard = lazy(() => import("../pages/Employe/Dashboard"));
const ProfileShowEmploye = lazy(() => import("../pages/Employe/Profil"));
const EmployeeProjectList = lazy(() => import("../pages/Employe/Projects/Index"));
const EmployeeProjectShow = lazy(() => import("../pages/Employe/Projects/Show"));
const EmployeeProjectTasks = lazy(() => import("../pages/Employe/Projects/Tasks"));
const EmployeeTaskList = lazy(() => import("../pages/Employe/Tasks/Index"));
const EmployeeTaskShow = lazy(() => import("../pages/Employe/Tasks/Show"));
const EmployeeTaskEdit = lazy(() => import("../pages/Employe/Tasks/Edit"));
const EmployeeTaskCreate = lazy(() => import("../pages/Employe/Tasks/Create"));

// Pages Admin - Lazy load
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
const ProfileShow = lazy(() => import("../pages/Admin/Profil"));
const ProfileEdit = lazy(() => import("../pages/Admin/Profil/Edit"));
const AdminUsers = lazy(() => import("../pages/Admin/Utilisateur/Index"));
const AdminUserShow = lazy(() => import("../pages/Admin/Utilisateur/Show"));
const AdminUserEdit = lazy(() => import("../pages/Admin/Utilisateur/Edit"));
const AdminProjectList = lazy(() => import("../pages/Admin/Projects/Index"));
const ProjectCreate = lazy(() => import("../pages/Admin/Projects/Create"));
const AdminProjectShow = lazy(() => import("../pages/Admin/Projects/Show"));
const AdminProjectEdit = lazy(() => import("../pages/Admin/Projects/Edit"));
const AdminProjectTasks = lazy(() => import("../pages/Admin/Projects/Tasks"));
const AdminTaskList = lazy(() => import("../pages/Admin/Tasks/Index"));
const AdminTaskShow = lazy(() => import("../pages/Admin/Tasks/Show"));
const AdminTaskEdit = lazy(() => import("../pages/Admin/Tasks/Edit"));
const AdminTaskCreate = lazy(() => import("../pages/Admin/Tasks/Create"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<PublicRoute> <Login /> </PublicRoute>} />
        
        {/* <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} /> */}
        <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />

        <Route path="/forgot-password" element={<PublicRoute> <ForgotPassword /> </PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute> <ResetPassword /> </PublicRoute>} />

        {/* Protégées - Utilisateur */}
        <Route path="/employe/dashboard" element={ <PrivateRoute allowedRoles={[false]}> <UserDashboard /> </PrivateRoute> } />

        <Route path="/employee/profile" element={<PrivateRoute allowedRoles={[false]}> <ProfileShowEmploye /> </PrivateRoute>} />

        <Route path="/employee/projects" element={<PrivateRoute allowedRoles={[false]}><EmployeeProjectList /></PrivateRoute>} />
        <Route path="/employee/projects/:id" element={<PrivateRoute allowedRoles={[false]}><EmployeeProjectShow /></PrivateRoute>} />
        <Route path="/employee/projects/:id/tasks" element={<PrivateRoute allowedRoles={[false]}><EmployeeProjectTasks /></PrivateRoute>} />

        <Route path="/employee/tasks" element={<PrivateRoute allowedRoles={[false]}><EmployeeTaskList /></PrivateRoute>} />
        <Route path="/employee/tasks/:id" element={<PrivateRoute allowedRoles={[false]}><EmployeeTaskShow /></PrivateRoute>} />
        <Route path="/employee/tasks/:id/edit" element={<PrivateRoute allowedRoles={[false]}><EmployeeTaskEdit /></PrivateRoute>} />
        <Route path="/employee/tasks/create" element={<PrivateRoute allowedRoles={[false]}><EmployeeTaskCreate /></PrivateRoute>} />

        {/* Protégées - Admin */}
        <Route path="/admin/dashboard" element={ <PrivateRoute allowedRoles={[true]}> <AdminDashboard /> </PrivateRoute> } />

        <Route path="/profile" element={<PrivateRoute allowedRoles={[true]}> <ProfileShow /> </PrivateRoute>} />
        {/* <Route path="/profile/edit" element={<PrivateRoute allowedRoles={[true]}> <ProfileEdit /> </PrivateRoute>} /> */}

        <Route path="/admin/users" element={<PrivateRoute allowedRoles={[true]}> <AdminUsers /> </PrivateRoute>} />
        <Route path="/admin/users/:id/edit" element={ <PrivateRoute allowedRoles={[true]}><AdminUserEdit /> </PrivateRoute>} />
        <Route path="/admin/users/:id" element={ <PrivateRoute allowedRoles={[true]}><AdminUserShow /> </PrivateRoute>} />

        <Route path="/admin/projects" element={<PrivateRoute allowedRoles={[true]}><AdminProjectList /></PrivateRoute>} />
        <Route path="/admin/projects/create" element={<PrivateRoute allowedRoles={[true]}><ProjectCreate /></PrivateRoute>} />
        <Route path="/admin/projects/:id" element={<PrivateRoute allowedRoles={[true]}><AdminProjectShow /></PrivateRoute>} />
        <Route path="/admin/projects/:id/edit" element={<PrivateRoute allowedRoles={[true]}><AdminProjectEdit /></PrivateRoute>} />
        <Route path="/admin/projects/:id/tasks" element={<PrivateRoute allowedRoles={[true]}> <AdminProjectTasks /> </PrivateRoute> } />

        <Route path="/admin/tasks" element={<PrivateRoute allowedRoles={[true]}><AdminTaskList /></PrivateRoute>} />
        <Route path="/admin/tasks/:id" element={<PrivateRoute allowedRoles={[true]}><AdminTaskShow /></PrivateRoute>} />
        <Route path="/admin/tasks/:id/edit" element={<PrivateRoute allowedRoles={[true]}><AdminTaskEdit /></PrivateRoute>} />
        <Route path="/admin/tasks/create" element={<PrivateRoute allowedRoles={[true]}> <AdminTaskCreate /> </PrivateRoute>} />
        
         
        {/* Catch-all pour les routes inexistantes */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}