# Website Tracker (Alpha Version)

Website Tracker is a web application that allows you to track changes in websites over time. You can add URLs of websites to the tracker, set an interval to check for changes, and receive notifications if any modifications are detected

## Features

- Add websites to track and set the interval for checking changes
- Receive notifications when a tracked website has been updated
- Remove tracked websites from the list
- Display the remaining intervals until the next check for each tracked website

## Getting Started

To get started with the Website Tracker application, follow these steps:

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd website-tracker`
3. Install the dependencies: `npm install`
4. Start the development server: `npm dev:chrome`
5. Add the extension to Chrome:
    1. Open Chrome and navigate to `chrome://extensions`
    2. Enable "Developer mode" in the top right corner
    3. Click "Load unpacked" in the top left corner
    4. Select the `build` folder in the project directory
6. Open your web browser and visit `http://localhost:3000` to access the application

## Usage

1. Enter the URL of a website in the provided input field
2. Set the interval (in seconds) for checking changes in the website
3. Click the "Track" button to start tracking the website
4. Tracked websites will be listed below with their favicon, remaining intervals, and a close button to remove them
5. If a tracked website has been updated, a notification will be displayed
6. To stop tracking a website, click the close button next to the website in the list

## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request

## License

This project is licensed under the [GPL-3.0 License](LICENSE).
