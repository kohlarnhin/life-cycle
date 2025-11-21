#!/bin/bash

# 生活效期管理系统 - 启动脚本

echo "🚀 正在启动生活效期管理系统..."
echo ""

# 启动后端服务（后台运行）
echo "📦 启动后端服务..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端服务（后台运行）
echo "🎨 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务已启动！"
echo "   后端 PID: $BACKEND_PID"
echo "   前端 PID: $FRONTEND_PID"
echo ""
echo "📱 访问地址: http://localhost:5173"
echo ""
echo "⚠️  按 Ctrl+C 停止服务"

# 捕获 Ctrl+C
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# 保持脚本运行
wait

