# Modern DevOps Portfolio

A premium, highly interactive, and animation-rich portfolio website built with Flutter. This project showcases a DevOps Engineer's skills, projects, and certifications with a focus on modern design aesthetics, smooth user experience, and a dynamic backend powered by Supabase.

## ✨ Key Features

### 1. 🗄️ Database-Driven Architecture (Supabase)
- **Fully Dynamic Content**: Hero, About, Skills, Projects, and Certifications sections are all dynamically fetched from a Supabase PostgreSQL backend.
- **Graceful Fallbacks**: The application handles empty tables or API errors seamlessly by defaulting to hardcoded fallback data.
- **In-Memory Caching**: Fetched data is cached per session to minimize API calls and ensure blazing-fast load times.
- **Environment Variables**: API keys and URLs are securely managed using `flutter_dotenv`.

### 2. 🖱️ Micro-Interactions
- **Magnetic Cursor Effect**: Navigation and social buttons subtly "pull" toward the cursor for a tactile feel.
- **Active State Feedback**: Buttons feature a subtle 3D-style depression and scale effect when clicked.
- **Premium Hover Effects**: Cards lift, glow, and scale smoothly on hover.

### 3. 📜 Smooth Scroll & Reading Experience
- **Dynamic Tech Stack Marquee**: A visually striking, infinite-scrolling tech stack ticker with gradient edge-fading in the Hero section.
- **Reading Progress Bar**: A sleek, glowing indicator at the top of the screen that fills as you scroll through the content.
- **Reveal on Scroll**: Elements animate into view (fade-in and slide-up) only when they enter the viewport using `visibility_detector`.
- **Staggered Entrance**: Skills and project grids load with coordinated "waterfall" delays for a professional entrance.

### 4. 🌌 3D Perspective & Depth
- **Mouse-Tracked Tilt**: Project and skill cards tilt in real-time based on the user's cursor position.
- **DevOps Orbit Visualization**: An interactive 3D orbit displaying core technical tools (Docker, AWS, Jenkins, etc.).
- **Ambient Background**: Floating geometric wireframes and particle systems that create a sense of depth and life.

### 5. ✍️ Typography & Text Effects
- **Typewriter Effect**: A dynamic "Hello, I am a..." section that cycles through various technical roles.
- **Animated Text Masking**: Section headings feature moving gradients that flow inside the letters.
- **Google Fonts Integration**: Uses modern typography (Inter, Roboto Mono) for a clean, technical look.

### 6. 🌓 Dynamic Theme System
- **Dark/Light Mode**: Fully responsive theme system modeled after modern professional aesthetics.
- **3D Theme Toggle**: A custom-animated sun/moon toggle with 3D rotation feedback.

---

## 🛠️ Technology Stack & Plugins

This project leverages several powerful Flutter plugins and external services to achieve its premium feel:

| Plugin/Service | Purpose |
| :--- | :--- |
| **`supabase_flutter`** | Real-time database backend and data fetching. |
| **`flutter_dotenv`** | Secure environment variable management. |
| **`flutter_animate`** | Powering complex, chained animations and effects. |
| **`animate_do`** | Providing smooth entrance animations. |
| **`visibility_detector`** | Triggering animations precisely when elements scroll into view. |
| **`google_fonts`** | Seamless integration with high-quality typography. |
| **`font_awesome_flutter`** | Access to a vast library of professional icons. |
| **`url_launcher`** | Handling external links (Resume, GitHub, Socials). |

---

## 🚀 Getting Started

### Prerequisites
- Flutter SDK (latest stable version recommended)
- A code editor (VS Code, Android Studio, etc.)
- A Supabase Project (for dynamic content)

### Installation
1. Clone the repository.
2. Run `flutter pub get` to install dependencies.
3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. *Optional:* Run the provided Supabase SQL Setup Script (available in the project documentation/artifacts) to initialize the tables and data.
5. Run `flutter run -d chrome` (or your preferred device) to launch the application.

### Build
To build the production-ready web application:
```bash
flutter build web --release
```

---

## 👨‍💻 Author
**Harikrishnan R**
DevOps Engineer | Cloud Architect | Infrastructure Builder
