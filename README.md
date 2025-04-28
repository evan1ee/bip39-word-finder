# BIP39 Word Finder

A simple React-based tool to find BIP39 mnemonic words based on binary value selections. This application allows users to select binary values (representing powers of 2 from 1 to 1024) and calculates their sum to display corresponding words from various BIP39 wordlists in multiple languages.

## Features

- **Binary Selection**: Select binary values using checkboxes to calculate a sum.
- **Multilingual Support**: Displays corresponding BIP39 mnemonic words in 10 languages:
  - English
  - Chinese (Simplified)
  - Chinese (Traditional)
  - Czech
  - French
  - Italian
  - Japanese
  - Korean
  - Portuguese
  - Spanish
- **Copy to Clipboard**: Easily copy words to clipboard with a single click.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **User Feedback**: Toast notifications for successful copy actions.

## Tech Stack

- **React**: Frontend library for building the user interface.
- **TypeScript**: For type safety and better developer experience.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn/ui**: Reusable UI components like Checkbox.
- **React Hot Toast**: For displaying notifications.
- **Lucide React**: Icon library for copy and check icons.

## Installation

To run this project locally, follow these steps:

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/evan1ee/bip39-word-finder.git
   cd bip39-word-finder
   ```

2. **Install Dependencies**:
   Using npm:
   ```bash
   npm install
   ```
   Or using yarn:
   ```bash
   yarn install
   ```

3. **Start the Development Server**:
   Using npm:
   ```bash
   npm run dev
   ```
   Or using yarn:
   ```bash
   yarn dev
   ```

4. **Open the Application**:
   Open your browser and navigate to `http://localhost:3000` (or the port specified by your setup).

## Usage

1. **Select Binary Values**: Checkboxes represent binary values from 1024 down to 1. Click on one or more checkboxes to select values.
2. **View Results**: The sum of selected values is displayed, along with corresponding BIP39 mnemonic words for each supported language.
3. **Copy Words**: Click on a word or the copy icon next to it to copy the word to your clipboard. A confirmation toast will appear.
4. **Reset Selection**: Uncheck boxes to reset the sum and hide the results.

## Project Structure

```
├── src
│   ├── components
│   │   └── ui
│   │       └── checkbox.tsx        # Shadcn/ui Checkbox component
│   ├── lib
│   │   └── wordlist                # BIP39 wordlists for each language
│   └── app
│       └── page.tsx                # Main component with logic and UI
├── public                          # Static assets (if any)
├── package.json                    # Project dependencies and scripts
└── README.md                       # Project documentation
```

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. **Fork the Repository**: Create your own fork of the codebase.
2. **Create a Branch**: Make your changes in a new branch.
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit Changes**: Commit your changes with a descriptive message.
   ```bash
   git commit -m "Add feature: your feature description"
   ```
4. **Push Changes**: Push your branch to your fork.
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request**: Open a pull request from your branch to the main repository.

Please ensure your code adheres to the existing style and includes appropriate tests if applicable.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need for a simple tool to explore BIP39 mnemonic words.
- Thanks to the creators of the BIP39 standard and wordlists.
- Built with love using open-source libraries like React, Tailwind CSS, and Shadcn/ui.


