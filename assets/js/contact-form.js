//assets/js/contact-form.js

import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('.contact__form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.querySelector('.contact__input[type="text"]').value;
      const email = document.querySelector('.contact__input[type="Email"]').value;
      const message = document.querySelector('textarea.contact__input').value;
      
      // Validate inputs
      if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
      }
      
      try {
        // Save message to Firebase
        const docRef = await addDoc(collection(db, "messages"), {
          name: name,
          email: email,
          message: message,
          timestamp: serverTimestamp()
        });
        
        console.log("Message sent with ID: ", docRef.id);
        
        // Reset form
        contactForm.reset();
        
        // Show success message
        alert('Message sent successfully! I will get back to you soon.');
      } catch (error) {
        console.error("Error sending message: ", error);
        alert('There was an error sending your message. Please try again later.');
      }
    });
  }
});