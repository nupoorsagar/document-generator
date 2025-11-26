// Mock data for demo purposes
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  document_type: string;
  outline: string;
  content?: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  sections: Section[];
}

export interface Section {
  id: number;
  title: string;
  content: string;
  order: number;
  project_id: number;
}

// Mock user
const mockUser: User = {
  id: 1,
  email: "demo@example.com",
  username: "demo_user",
  created_at: new Date().toISOString()
};

// Mock projects
const mockProjects: Project[] = [
  {
    id: 1,
    title: "Q4 Marketing Strategy",
    document_type: "docx",
    outline: "1. Executive Summary\n2. Market Analysis\n3. Strategy Overview\n4. Action Plan",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    user_id: 1,
    sections: [
      {
        id: 1,
        title: "Executive Summary",
        content: "This document outlines our Q4 marketing strategy focusing on digital transformation and customer engagement.",
        order: 1,
        project_id: 1
      },
      {
        id: 2,
        title: "Market Analysis",
        content: "Current market trends show increased demand for personalized customer experiences and AI-driven solutions.",
        order: 2,
        project_id: 1
      }
    ]
  },
  {
    id: 2,
    title: "Product Launch Presentation",
    document_type: "pptx",
    outline: "1. Introduction\n2. Product Features\n3. Market Opportunity\n4. Timeline",
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    user_id: 1,
    sections: [
      {
        id: 3,
        title: "Introduction",
        content: "Welcome to our revolutionary new product that will transform the industry.",
        order: 1,
        project_id: 2
      }
    ]
  },
  {
    id: 3,
    title: "Annual Report 2024",
    document_type: "docx",
    outline: "1. Company Overview\n2. Financial Performance\n3. Future Outlook",
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
    user_id: 1,
    sections: []
  }
];

// Mock API service
export const mockAuthService = {
  register: async (email: string, username: string, password: string) => {
    return mockUser;
  },

  login: async (username: string, password: string) => {
    localStorage.setItem('token', 'mock-token-12345');
    return { access_token: 'mock-token-12345', token_type: 'bearer' };
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    return mockUser;
  },
};

export const mockProjectService = {
  create: async (title: string, document_type: string, outline: string): Promise<Project> => {
    const newProject: Project = {
      id: mockProjects.length + 1,
      title,
      document_type,
      outline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 1,
      sections: []
    };
    mockProjects.push(newProject);
    return newProject;
  },

  list: async (): Promise<Project[]> => {
    return mockProjects;
  },

  get: async (projectId: number): Promise<Project> => {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return project;
  },

  update: async (projectId: number, data: Partial<Project>): Promise<Project> => {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return { ...project, ...data };
  },

  delete: async (projectId: number) => {
    const index = mockProjects.findIndex(p => p.id === projectId);
    if (index > -1) mockProjects.splice(index, 1);
    return { message: 'Project deleted successfully' };
  },

  generateOutline: async (topic: string, documentType: string): Promise<string> => {
    return `1. Introduction to ${topic}\n2. Main Content\n3. Key Points\n4. Conclusion`;
  },

  generateContent: async (
    projectId: number,
    outline: string,
    documentType: string,
    additionalInstructions?: string
  ) => {
    return {
      message: 'Content generated successfully (Demo)',
      sections: [
        { title: 'Section 1', content: 'Demo content for section 1', order: 1 },
        { title: 'Section 2', content: 'Demo content for section 2', order: 2 }
      ]
    };
  },

  refineSection: async (
    sectionId: number,
    currentContent: string,
    refinementInstructions: string
  ): Promise<string> => {
    return `${currentContent}\n\n[Refined based on: ${refinementInstructions}]`;
  },

  export: async (projectId: number) => {
    alert('Export functionality requires backend connection. This is a demo version.');
    return { data: new Blob() };
  },
};
