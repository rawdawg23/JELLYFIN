# Jellyfin Store Setup

A modern, responsive web application for Jellyfin server management and community features.

## Features

- **User Authentication**: Secure login and registration system
- **Jellyfin Quick Connect**: Easy device connection using Quick Connect codes
- **Emby Connect Integration**: Connect to Emby servers with credentials
- **Community Features**: Forums, messaging, and ticket system
- **Responsive Design**: Works seamlessly across all devices
- **Premium UI**: iOS-inspired design with smooth animations

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

- Username: `ogadmin`
- Password: `Ebony2025`

## Quick Connect Testing

The application includes a comprehensive testing system for Quick Connect functionality:

- Generate test codes for various device types
- Simulate connection scenarios
- Test network conditions and error handling
- Validate cross-platform compatibility

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI components
- **Lucide React**: Beautiful icons

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── profile/          # User profile components
│   ├── auth/             # Authentication components
│   └── ...
├── lib/                  # Utility functions and contexts
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
