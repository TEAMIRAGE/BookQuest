# Inspiration
The inception of BookQuest arose from the necessity to streamline library management and foster a seamless interaction between students and an enriched repository of books. Recognizing the need for an efficient system that empowers students in book acquisition and knowledge exploration prompted the creation of this platform.

# What it does
BookQuest is a comprehensive library management system providing an interface for students and administrators. Students have the ability to create accounts pending approval from the admin, request books for checkout, and seek guidance regarding books through an integrated AI system. Each book request undergoes an admin approval process, and students receive notifications upon approval.

# How we built it
BookQuest was developed by integrating robust web development technologies with AI functionalities. The front-end was crafted using HTML, CSS, TailwindCSS, and JavaScript, ensuring a user-friendly experience. For the back-end, Node.js with Express and related Node packages were employed. The system's database leverages MongoDB for storing user details and book information. For images we have used Google cloud platform's Bucket and for integrating the AI system that used PALM2 model for book-related queries using Flask .

# Challenges we ran into
The primary challenge revolved around the integration of the AI system with the platform to ensure accurate and helpful responses to student inquiries. Additionally, establishing the approval process and notifications for book requests between students and admins required careful implementation.

# Accomplishments that we're proud of
We take pride in creating a user-friendly and efficient platform that enhances the student experience in accessing books. The successful integration of the approval process and notifications for book requests ensures a streamlined interaction between students and the library.

# What we learned
Developing BookQuest provided invaluable insights into effective library management system design and the integration of AI to cater to student queries. Understanding the significance of user approval processes and notifications was a key learning point.

# What's next for BookQuest
Moving forward, BookQuest aims to broaden its scope by including additional features for students and admins. The future roadmap involves enhancing the AI system to provide more comprehensive book-related guidance. Continuous improvements in user experience and exploring new technologies remain a priority to ensure BookQuest stays at the forefront of innovative library management systems. We also plan to integrate a fine system in which students will be charged a fine if they return the book after the deadline.

# Built With
docker, express.js, flask, google-cloud, javascript, jwt, mongodb, node.js, npm, tailwindcss, vertexai.
