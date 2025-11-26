
import React, { useState, useEffect } from 'react';
// Import both real and mock services
import { authService, projectService, Project, Section } from './services/api';
import { mockAuthService, mockProjectService } from './services/mockApi';
import './App.css';

// Use mock services for demo (set to true for Vercel deployment)
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK === 'true' || true;

// Select which service to use
const auth = USE_MOCK_DATA ? mockAuthService : authService;
const projects = USE_MOCK_DATA ? mockProjectService : projectService;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'create' | 'editor'>('login');
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New project form
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [documentType, setDocumentType] = useState<'docx' | 'pptx'>('docx');
  const [outlineTopic, setOutlineTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Refinement
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [refinementInstructions, setRefinementInstructions] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token || USE_MOCK_DATA) {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      loadProjects();
    }
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projects.list();
      setProjectList(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.login(username, password);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      await loadProjects();
    } catch (err: any) {
      setError(USE_MOCK_DATA ? '' : (err.response?.data?.detail || 'Login failed'));
      // Auto-login in demo mode
      if (USE_MOCK_DATA) {
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        await loadProjects();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.register(email, username, password);
      await auth.login(username, password);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      await loadProjects();
    } catch (err: any) {
      setError(USE_MOCK_DATA ? '' : (err.response?.data?.detail || 'Registration failed'));
      // Auto-login in demo mode
      if (USE_MOCK_DATA) {
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        await loadProjects();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setCurrentView('login');
    setProjectList([]);
    setCurrentProject(null);
  };

  const handleGenerateOutline = async () => {
    setLoading(true);
    try {
      const generatedOutline = await projects.generateOutline(outlineTopic, documentType);
      setOutline(generatedOutline);
    } catch (err) {
      setError('Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await projects.create(newProjectTitle, documentType, outline);
      setProjectList([...projectList, project]);
      setNewProjectTitle('');
      setOutline('');
      setOutlineTopic('');
      setCurrentView('dashboard');
    } catch (err) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      await projects.generateContent(
        currentProject.id,
        currentProject.outline,
        currentProject.document_type,
        additionalInstructions
      );
      const updatedProject = await projects.get(currentProject.id);
      setCurrentProject(updatedProject);
      setAdditionalInstructions('');
    } catch (err) {
      setError('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleRefineSection = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const refinedContent = await projects.refineSection(
        selectedSection.id,
        selectedSection.content,
        refinementInstructions
      );
      
      if (currentProject) {
        const updatedSections = currentProject.sections.map(s =>
          s.id === selectedSection.id ? { ...s, content: refinedContent } : s
        );
        setCurrentProject({ ...currentProject, sections: updatedSections });
        setSelectedSection({ ...selectedSection, content: refinedContent });
      }
      setRefinementInstructions('');
    } catch (err) {
      setError('Failed to refine section');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const response = await projects.export(currentProject.id);
      if (!USE_MOCK_DATA) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${currentProject.title}.${currentProject.document_type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setError('Failed to export document');
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (projectId: number) => {
    setLoading(true);
    try {
      const project = await projects.get(projectId);
      setCurrentProject(project);
      setCurrentView('editor');
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  // Add demo banner
  const DemoBanner = () => USE_MOCK_DATA ? (
    <div style={{
      background: '#ff9800',
      color: 'white',
      padding: '0.5rem',
      textAlign: 'center',
      fontSize: '0.9rem'
    }}>
      🎭 Demo Mode - Using mock data. Connect to backend for full functionality.
    </div>
  ) : null;

  // ... rest of your existing App.tsx code remains the same ...
  // Just add <DemoBanner /> at the top of your return statement

  if (!isAuthenticated) {
    return (
      <div className="app">
        <DemoBanner />
        {/* ... existing auth UI ... */}
      </div>
    );
  }

  // ... rest of your component code ...
}

export default App;
