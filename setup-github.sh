#!/bin/bash

echo "Setting up GitHub repository for AI Agent project..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/"
    exit 1
fi

# Create GitHub repository
echo "Creating GitHub repository..."
gh repo create vibe-ai-agent --public --description "AI Agent with AWS Integration - Vibe Coding Platform" --source=. --remote=origin --push

echo "Repository created and pushed successfully!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository: vibe-ai-agent"
echo "3. Configure environment variables in Vercel:"
echo "   - OPENAI_API_KEY"
echo "   - AWS_ACCESS_KEY_ID (optional)"
echo "   - AWS_SECRET_ACCESS_KEY (optional)"
echo "   - AWS_REGION (optional)"
echo "4. Deploy!"
echo ""
echo "Your repository URL will be: https://github.com/$(gh api user --jq .login)/vibe-ai-agent"