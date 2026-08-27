# CandyInvito Studio

CandyInvito Studio is a premium, modern wedding invitation platform and builder. It allows administrators, clients, and guests to interact with highly customized, animated, and responsive digital invitations.

## Overview
This platform provides:
- A sophisticated **Client Dashboard** for couples to manage their wedding details and RSVPs.
- A **Visual Canvas Editor** allowing clients to customize templates, colors, and content in real-time.
- An **Admin Panel** for the agency to review deployment requests and manage clients.
- Stunning **Guest Experiences** through performant, animated, and premium invitation templates.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI, Framer Motion
- **Routing**: TanStack Router
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Local Development
To run this project locally:

1. **Clone the repository:**
   `ash
   git clone https://github.com/Shivateja1322/candyinvito-studio-v2.git
   cd candyinvito-studio-v2
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Set up Environment Variables:**
   Create a .env file in the root directory and add your Supabase credentials:
   `env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   `

4. **Start the development server:**
   `ash
   npm run dev
   `

## Production Deployment
The project is configured for seamless deployment on Vercel:
1. Import the repository into Vercel.
2. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
3. Vercel will automatically detect the Vite build settings and deploy the application.
