# Jellyfin Store Application

This is a Next.js application designed to demonstrate various features for a Jellyfin-like media server store, including user authentication, server connection management (Jellyfin Quick Connect, Emby Connect), admin dashboard functionalities, forum, messaging, support ticket system, and a premium subscription section with PayPal integration. It also includes interactive 3D elements like a hero slider and a live user map.

## Features

-   **User Authentication**: Mock login system with username "user" and password "password".
-   **Jellyfin Quick Connect**: Simulate checking and linking Jellyfin servers using Quick Connect codes.
-   **Emby Connect**: Simulate connecting to Emby servers with URL and API key.
-   **Admin Dashboard**: Mock server status monitoring, user management, and system settings.
-   **Forum System**: Create and manage forum posts and replies.
-   **Messaging System**: Simulate real-time chat with an AI echo.
-   **Support Ticket System**: Create, update, and delete support tickets with priority and status.
-   **Premium Subscription**: Mock PayPal integration for subscribing to a premium plan.
-   **3D Hero Slider**: Interactive 3D carousel for showcasing content.
-   **3D Live Map**: A globe displaying mock user locations with interactive markers.
-   **Movie Carousel**: A responsive carousel for featured media collections.
-   **UK Time Display**: A component showing the current time in the UK.
-   **Responsive Design**: Optimized for various screen sizes using Tailwind CSS.
-   **Shadcn/ui**: Utilizes Shadcn/ui components for a modern and accessible UI.

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository**:
    \`\`\`bash
    git clone [repository-url]
    cd jellyfin-store
    \`\`\`
2.  **Install dependencies**:
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`
3.  **Run the development server**:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

-   `app/page.tsx`: Main application entry point, handling login state.
-   `components/`: Contains all reusable React components, categorized by feature (e.g., `auth`, `profile`, `admin`, `forum`, `messaging`, `tickets`, `testing`, `ui`).
-   `lib/`: Utility functions and Zustand stores for state management (e.g., `jellyfin-api.ts`, `emby-api.ts`, `date-utils.ts`, `forum-store.tsx`, `message-store.tsx`, `ticket-store.tsx`, `utils.ts`).
-   `providers/`: React context providers, such as `AuthProvider`.
-   `public/`: Static assets like images.
-   `styles/globals.css`: Global CSS styles, including Tailwind CSS imports.

## Technologies Used

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   Shadcn/ui
-   Zustand (for state management)
-   React Three Fiber / Drei (for 3D rendering)
-   Lucide React (for icons)
-   Date-fns (for date formatting)
-   UUID (for unique IDs)

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open-source and available under the [MIT License](LICENSE).
