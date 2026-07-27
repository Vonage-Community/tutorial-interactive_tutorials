#!/bin/bash 
 
# Ensure execution stops if a step fails 
set -e 

echo "📦 Clearing environment tokens..."
unset GITHUB_TOKEN && gh auth login --scopes repo

# Check if the user is authenticated with repo scopes
if ! gh auth status &>/dev/null; then
    echo "🔑 Please authenticate your personal GitHub account to create a new repository:"
    gh auth login --scopes repo
fi

echo "=========================================" 
echo "  📦 Exporting Your Workshop Project     " 
echo "=========================================" 
 
# 1. Initialize a clean, local repository 
echo "Initializing a brand new git tree..." 
git init -b main 
 
# 2. Stage and commit all target workshop files 
echo "Staging files..." 
git add . 
git commit -m "Initial commit: Completed Vonage Voice API Workshop" 
 
# 3. Use GitHub CLI for an elegant, interactive push  
echo "" 
echo "Let's upload this to your personal GitHub profile." 
echo "Follow the prompts below to authenticate and name your new repository." 
echo "--------------------------------------------------" 
 
# 'gh repo create' natively prompts the user if they want to create a repo from the current folder, 
# names it, sets visibility, creates it on GitHub, and adds/pushes the remote automatically! 
# gh repo create --source=. --remote=origin --push 
read -p "Enter a name for your new GitHub repository: " repo_name

echo "🚀 Creating repository and pushing code..."
gh repo create "$repo_name" --public --source=. --remote=origin --push

echo "" 
echo "=========================================" 
echo " 🎉 SUCCESS! Your project is safely on GitHub." 
echo "=========================================" 
 