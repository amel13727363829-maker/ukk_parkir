#!/bin/bash
# Quick start both backend and frontend
# Use this when you want to restart everything fresh

echo "🔄 Restarting Parkir Plus..."
echo ""

# Kill existing processes (optional)
echo "📋 Checking if services are running..."
netstat -an | grep -E ":5001|:3000" | wc -l

echo ""
echo "✅ Services Status:"
echo "  Backend (5001): $(netstat -an | grep :5001 | wc -l) connection(s)"
echo "  Frontend (3000): $(netstat -an | grep :3000 | wc -l) connection(s)"

echo ""
echo "🚀 To test login:"
echo "  1. Open: http://localhost:3000/login"
echo "  2. Credentials:"
echo "     Username: admin"
echo "     Password: admin123"
echo ""
echo "  3. Or use diagnostic: http://localhost:3000/login-diagnostic.html"
echo ""

