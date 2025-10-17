# SnoozeRN - Sleep Tracker for Healthcare Workers

A comprehensive sleep tracking and scheduling app designed specifically for healthcare shift workers. Optimizes sleep schedules based on chronotype and shift patterns.

## Features

- 🌙 **Chronotype-Based Recommendations**: Tailored advice for Early Birds, Common Sparrows, and Night Owls
- 📅 **Schedule Planning**: Manual shift entry with intelligent sleep recommendations
- 📊 **Sleep Tracking**: Log sleep quality, duration, and sleep adjuncts
- 💊 **Custom Adjuncts**: Track any sleep aid (melatonin, caffeine timing, etc.)
- 📈 **Analytics**: Average sleep quality and duration for each adjunct
- 🔄 **Shift Transitions**: Smart recommendations for Day/Evening/Night shift changes

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snoozern.git
cd snoozern
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Method 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure settings
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and your app will be deployed

## Project Structure

```
snoozern/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Usage

### Schedule Planning

1. Select your chronotype (Early Bird, Common Sparrow, or Night Owl)
2. Click "Manual Entry" to input your shifts for the week
3. Select Day (7am-7pm), Evening (3pm-11pm), Night (7pm-7am), or Off for each day
4. Click "Generate Sleep Plan" to see personalized sleep recommendations

### Sleep Tracking

1. Navigate to the "Sleep Tracking" tab
2. Click "Log Sleep Session"
3. Enter date, sleep/wake times, and quality rating (1-10)
4. Select any sleep adjuncts used
5. Add custom adjuncts as needed
6. View history and statistics for each adjunct

## Future Enhancements

- [ ] Google Calendar API integration
- [ ] Data export (CSV/PDF)
- [ ] Advanced analytics and trends
- [ ] Push notifications for sleep reminders
- [ ] Dark mode toggle
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for healthcare workers everywhere
