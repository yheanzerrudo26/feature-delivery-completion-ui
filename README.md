# Mabuli Leather Works - Setup Guide

## Clone the Repository

Copy the repository link:  
<https://github.com/devcodee25/Mabuli-Leather-Works.git>

Open VS Code and make sure you have the **GitHub Pull Requests extension** installed.
Go to **Source Control** and click **Clone Repository**.
Paste the repository link and press **Enter**.
Create a folder on your local machine, then open it in VS Code.

## Create Your Own Branch

Open the terminal in VS Code.
Run the following command to create and switch to a new branch:
git checkout -b your-branch-name
Push your new branch to the remote repository: git push origin your-branch-name

## Keep Your Branch Updated

Make sure you are on your branch: git checkout your-branch-name
Fetch the latest changes from the remote repository: git fetch origin
Merge the latest updates from the main branch: git merge main

## Installation & Running the App

Download Expo Go from the Play Store.
Open the project folder in VS Code.
Open the terminal and run: npx expo start
Scan the QR code using Expo Go.
Start developing.

## Daily Workflow (Before You Start Developing)

Open your project in VS Code.
Make sure you are on your branch: git checkout your-branch-name
Fetch the latest updates: git fetch origin
Pull the latest changes from the main branch into your branch: git merge main
Resolve any merge conflicts if they appear.
Run the project to make sure everything is working: npx expo start
Start developing.

## After Developing (Save Your Work)

Add your changes: git add .
Commit your changes: git commit -m "your message"
Push to your branch: git push origin your-branch-name
