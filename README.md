Mabuli Leather Works – Setup Guide

Clone the Repository
1. Copy the repository link: https://github.com/devcodee25/Mabuli-Leather-Works.git
2. Open VS Code and make sure you have the GitHub Pull Requests extension installed.
3. Go to Source Control and click Clone Repository.
4. Paste the repository link and press Enter.
5. Create a folder on your local machine, then open it in VS Code.

Create Your Own Branch
1. Open the terminal in VS Code.
2. Run the following command to create and switch to a new branch: git checkout -b <your-branch-name>
3. Push your new branch to the remote repository: git push origin <your-branch-name>

Keep Your Branch Updated
1. Make sure you are on your branch: git checkout <your-branch-name>
2. Fetch the latest changes from the remote repository: git fetch origin
3. Merge the latest updates from the main branch: git merge main

Installation & Running the App
1. Download Expo Go from the Play Store.
2. Open the project folder in VS Code.
3. Open the terminal and run: npx expo start
4. Scan the QR code using Expo Go.
5. Start developing.
--------------------------------------------------------------------------------------------------------------
Daily Workflow (Before You Start Developing)
1. Open your project in VS Code.
2. Open the terminal and make sure you are on your branch: git checkout <your-branch-name>
3. Fetch the latest updates from the remote repository: git fetch origin
4. Pull the latest changes from the main branch into your branch: git merge main
5. Resolve any merge conflicts if they appear.
6. Run the project to make sure everything is working: npx expo start
7. Start developing

After Developing (Save Your Work)
1. Add your changes: git add .
2. Commit your changes: git commit -m "your message"
3. Push to your branch: git push origin <your-branch-name>
