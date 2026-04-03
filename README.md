# WalkMe Tour

A React Native app for guided walking tours in cities around the world, built with [Expo](https://expo.dev/).

## Features

- 🗺️ **Multiple city tours** – curated walking tours for Paris, Rome, Tokyo, New York, and Barcelona
- 📍 **Stops & waypoints** – each tour lists its stops in order with addresses and estimated time
- ℹ️ **Stop details** – rich descriptions and practical visitor tips for every stop
- 🎨 **Per-city colour themes** – each city has its own colour used throughout the UI
- 🧭 **Stack navigation** – Home → Tour → Stop, with a native back button on every screen

## Screens

| Screen   | Description                                                                             |
| -------- | --------------------------------------------------------------------------------------- |
| **Home** | Lists all available city tours with distance, duration, difficulty, and number of stops |
| **Tour** | Shows the selected tour's hero banner and ordered list of stops                         |
| **Stop** | Displays full details for a single stop: address, type, description, and visitor tips   |

## Tech Stack

| Library                                                                                       | Purpose                    |
| --------------------------------------------------------------------------------------------- | -------------------------- |
| [Expo](https://expo.dev/) (~54)                                                               | Build toolchain & runtime  |
| [React Native](https://reactnative.dev/) (0.81)                                               | Core UI framework          |
| [@react-navigation/native](https://reactnavigation.org/)                                      | Navigation container       |
| [@react-navigation/native-stack](https://reactnavigation.org/)                                | Stack navigator            |
| [react-native-screens](https://github.com/software-mansion/react-native-screens)              | Native screen optimisation |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | Safe area handling         |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Expo Go](https://expo.dev/go) app on your iOS or Android device (for testing on a real device), **or** an Android/iOS simulator

### Install

```bash
git clone https://github.com/alebrozzo/walkme-tour.git
cd walkme-tour
npm install
```

### Run

```bash
# Start the Expo development server
npm start

# Open directly on Android
npm run android

# Open directly on iOS (macOS only)
npm run ios

# Open in a web browser
npm run web
```

After running `npm start`, scan the QR code with Expo Go on your phone, or press `a` for Android or `i` for iOS in the terminal.

## Deploying Web (GitHub Pages)

This project can be deployed as a static web app using GitHub Pages.

### Manual production build

```bash
npm run build:web
```

The generated static site is output to `dist/`.

### Manual deployment

A GitHub Actions workflow at `.github/workflows/deploy-web.yml` deploys `dist/` to GitHub Pages when triggered manually.

To enable it:

1. Open repository settings on GitHub.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.

To run a deployment:

1. Open the **Actions** tab on GitHub.
2. Select the **Deploy Web** workflow.
3. Enter the `ref` to deploy (for example `main` or `feature/deploy-to-web`).
4. Click **Run workflow**.

## Project Structure

```
walkme-tour/
├── App.tsx                 # Root component – navigation setup
├── app.json                # Expo configuration
├── index.ts                # Entry point
├── assets/                 # App icons and splash screen
└── src/
    ├── constants/
    │   └── stopTypes.ts    # Shared stop-type icon mapping
    ├── data/
    │   └── tours.ts        # Tour & stop data for all cities
    ├── screens/
    │   ├── HomeScreen.tsx  # Tour list
    │   ├── TourScreen.tsx  # Stop list for a tour
    │   └── StopScreen.tsx  # Stop detail view
    └── types/
        └── index.ts        # Shared TypeScript types
```

## Adding a New City Tour

Open `src/data/tours.ts` and add a new entry to the `tours` array following the existing pattern:

```js
{
  id: '6',
  city: 'London',
  country: 'United Kingdom',
  description: 'A short description of the tour.',
  duration: 180,       // total minutes
  distance: 5.5,       // kilometres
  difficulty: 'easy',  // 'easy' | 'moderate' | 'hard'
  color: '#1565C0',    // hex colour used for the theme
  stops: [
    {
      id: '6-1',
      order: 1,
      name: 'Tower of London',
      address: 'Tower Hill, London EC3N 4AB',
      type: 'landmark', // landmark | museum | park | neighborhood | temple | shrine | piazza | market | beach
      description: 'Historic castle on the north bank of the River Thames.',
      duration: 60,     // minutes at this stop
      tips: 'Book tickets online to skip the queue.',
    },
    // ... more stops
  ],
}
```
