import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Home from "./pages/Home";
import Vocabulary from "./pages/Vocabulary";
import Grammar from "./pages/Grammar";
import Exercises from "./pages/Exercises";
import IrregularVerbs from "./pages/IrregularVerbs";
import Progress from "./pages/Progress";
import Dictionary from "./pages/Dictionary";
import AuthPage from "./pages/AuthPage";
import Quiz from "./pages/Quiz";
import Flashcard from "./pages/Flashcard";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import TopicsPage from "./pages/admin/TopicsPage";
import GrammarPage from "./pages/admin/GrammarPage";
import ExercisesPage from "./pages/admin/ExercisesPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/irregular-verbs" element={<IrregularVerbs />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/flashcard" element={<Flashcard />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="topics" element={<TopicsPage />} />
              <Route path="grammar" element={<GrammarPage />} />
              <Route path="exercises" element={<ExercisesPage />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
