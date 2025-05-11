// client/assets/js/projects.js

import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
  // Only fetch projects if we're on the portfolio/projects section
  const portfolioSection = document.getElementById('portfolio');
  
  if (portfolioSection) {
    try {
      const projectsSnapshot = await getDocs(
        query(collection(db, "projects"), orderBy("order", "asc"))
      );
      
      // If we have projects in Firebase, use them instead of the static HTML
      if (!projectsSnapshot.empty) {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        
        // Clear existing static projects
        swiperWrapper.innerHTML = '';
        
        // Add projects from Firebase
        projectsSnapshot.forEach((doc) => {
          const project = doc.data();
          
          // Create project slide HTML
          const projectSlide = document.createElement('div');
          projectSlide.className = 'portfolio__content grid swiper-slide';
          
          projectSlide.innerHTML = `
            <img src="${project.imageUrl}" class="portfolio__img" alt="${project.title}" />
            
            <div class="portfolio__data">
              <h3 class="portfolio__title">${project.title}</h3>
              <p class="portfolio__description">${project.description}</p>
              
              <a href="${project.githubUrl}" class="button button--flex button--small portfolio__button">
                GitHub Repository
                <i class="uil uil-external-link-alt button__icon"></i>
              </a>
              
              ${project.liveUrl ? `
                <a href="${project.liveUrl}" class="button button--flex button--small portfolio__button">
                  See Live
                  <i class="uil uil-external-link-alt button__icon"></i>
                </a>
              ` : ''}
            </div>
          `;
          
          // Add to swiper
          swiperWrapper.appendChild(projectSlide);
        });
        
        // Reinitialize Swiper after dynamic content load
        if (window.portfolioSwiper) {
          window.portfolioSwiper.update();
        }
      }
    } catch (error) {
      console.error("Error fetching projects: ", error);
      // Fall back to static projects if there's an error
    }
  }
});