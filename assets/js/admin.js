// client/assets/js/admin.js

import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the admin page
  const adminSection = document.getElementById('admin-login');
  if (!adminSection) return;

  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('admin-email').value;
      const password = document.getElementById('admin-password').value;
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Show admin dashboard after successful login
        showAdminDashboard();
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
      }
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        // Hide admin dashboard after logout
        hideAdminDashboard();
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }

  // Project form submission
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const projectData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        imageUrl: document.getElementById('project-image').value,
        githubUrl: document.getElementById('project-github').value,
        liveUrl: document.getElementById('project-live').value,
        order: parseInt(document.getElementById('project-order').value) || 0,
        timestamp: serverTimestamp()
      };
      
      try {
        // Check if editing or adding new
        const projectId = projectForm.dataset.projectId;
        
        if (projectId) {
          // Update existing project
          await updateDoc(doc(db, "projects", projectId), projectData);
          alert("Project updated successfully!");
        } else {
          // Add new project
          await addDoc(collection(db, "projects"), projectData);
          alert("Project added successfully!");
        }
        
        // Reset form and refresh project list
        projectForm.reset();
        projectForm.dataset.projectId = '';
        loadProjects();
      } catch (error) {
        console.error("Error saving project:", error);
        alert("Error saving project: " + error.message);
      }
    });
  }

  // Auth state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      showAdminDashboard();
      loadProjects();
      loadMessages();
    } else {
      hideAdminDashboard();
    }
  });
});

// Show admin dashboard and hide login form
function showAdminDashboard() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
}

// Hide admin dashboard and show login form
function hideAdminDashboard() {
  document.getElementById('admin-login').style.display = 'block';
  document.getElementById('admin-dashboard').style.display = 'none';
}

// Load projects for admin management
async function loadProjects() {
  const projectsContainer = document.getElementById('projects-list');
  if (!projectsContainer) return;
  
  try {
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    
    // Clear existing items
    projectsContainer.innerHTML = '';
    
    projectsSnapshot.forEach((doc) => {
      const project = doc.data();
      const projectId = doc.id;
      
      const projectElement = document.createElement('div');
      projectElement.className = 'admin-project-item';
      projectElement.innerHTML = `
        <h3>${project.title}</h3>
        <div class="admin-project-actions">
          <button class="edit-project" data-id="${projectId}">Edit</button>
          <button class="delete-project" data-id="${projectId}">Delete</button>
        </div>
      `;
      
      projectsContainer.appendChild(projectElement);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-project').forEach(btn => {
      btn.addEventListener('click', (e) => editProject(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-project').forEach(btn => {
      btn.addEventListener('click', (e) => deleteProject(e.target.dataset.id));
    });
  } catch (error) {
    console.error("Error loading projects:", error);
  }
}

// Load contact messages for admin review
async function loadMessages() {
  const messagesContainer = document.getElementById('messages-list');
  if (!messagesContainer) return;
  
  try {
    const messagesSnapshot = await getDocs(collection(db, "messages"));
    
    // Clear existing items
    messagesContainer.innerHTML = '';
    
    if (messagesSnapshot.empty) {
      messagesContainer.innerHTML = '<p>No messages yet.</p>';
      return;
    }
    
    messagesSnapshot.forEach((doc) => {
      const message = doc.data();
      const messageId = doc.id;
      
      const date = message.timestamp ? new Date(message.timestamp.toDate()).toLocaleString() : 'Unknown date';
      
      const messageElement = document.createElement('div');
      messageElement.className = 'admin-message-item';
      messageElement.innerHTML = `
        <div class="message-header">
          <strong>${message.name}</strong> (${message.email})
          <span class="message-date">${date}</span>
        </div>
        <div class="message-body">${message.message}</div>
        <button class="delete-message" data-id="${messageId}">Delete</button>
      `;
      
      messagesContainer.appendChild(messageElement);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-message').forEach(btn => {
      btn.addEventListener('click', (e) => deleteMessage(e.target.dataset.id));
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

// Edit a project (populate form with project data)
async function editProject(projectId) {
  try {
    const projectDoc = await doc(db, "projects", projectId);
    const projectSnapshot = await getDoc(projectDoc);
    
    if (projectSnapshot.exists()) {
      const project = projectSnapshot.data();
      
      // Populate form fields
      document.getElementById('project-title').value = project.title;
      document.getElementById('project-description').value = project.description;
      document.getElementById('project-image').value = project.imageUrl;
      document.getElementById('project-github').value = project.githubUrl;
      document.getElementById('project-live').value = project.liveUrl || '';
      document.getElementById('project-order').value = project.order || 0;
      
      // Set project ID in form dataset for update operation
      document.getElementById('project-form').dataset.projectId = projectId;
    }
  } catch (error) {
    console.error("Error editing project:", error);
  }
}

// Delete a project
async function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      alert("Project deleted successfully!");
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project: " + error.message);
    }
  }
}

// Delete a message
async function deleteMessage(messageId) {
  if (confirm("Are you sure you want to delete this message?")) {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      alert("Message deleted successfully!");
      loadMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Error deleting message: " + error.message);
    }
  }
}