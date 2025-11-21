#!/bin/bash

# 生活效期管理系统 - 后台启动脚本

BASE_DIR=$(cd "$(dirname "$0")" && pwd)
LOG_DIR="$BASE_DIR/logs"

# 创建日志目录
mkdir -p "$LOG_DIR"

echo "🚀 正在后台启动生活效期管理系统..."
echo ""

# 检查并停止已运行的进程
if [ -f "$BASE_DIR/.backend.pid" ]; then
  OLD_PID=$(cat "$BASE_DIR/.backend.pid")
  if ps -p $OLD_PID > /dev/null 2>&1; then
    echo "🛑 停止旧的后端进程 (PID: $OLD_PID)..."
    kill $OLD_PID 2>/dev/null
    sleep 1
  fi
  rm -f "$BASE_DIR/.backend.pid"
fi

if [ -f "$BASE_DIR/.frontend.pid" ]; then
  OLD_PID=$(cat "$BASE_DIR/.frontend.pid")
  if ps -p $OLD_PID > /dev/null 2>&1; then
    echo "🛑 停止旧的前端进程 (PID: $OLD_PID)..."
    kill $OLD_PID 2>/dev/null
    sleep 1
  fi
  rm -f "$BASE_DIR/.frontend.pid"
fi

# 启动后端服务
echo "📦 启动后端服务..."
cd "$BASE_DIR/backend"
nohup node server.js > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BASE_DIR/.backend.pid"
echo "   后端 PID: $BACKEND_PID"
echo "   日志文件: $LOG_DIR/backend.log"

# 等待后端启动
sleep 2

# 启动前端服务
echo "🎨 启动前端服务..."
cd "$BASE_DIR/frontend"
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$BASE_DIR/.frontend.pid"
echo "   前端 PID: $FRONTEND_PID"
echo "   日志文件: $LOG_DIR/frontend.log"

echo ""
echo "✅ 服务已在后台启动！"
echo ""
echo "📱 访问地址: http://localhost:5173"
echo "   局域网访问: http://$(hostname -I | awk '{print $1}'):5173"
echo ""
echo "📋 查看日志："
echo "   后端: tail -f $LOG_DIR/backend.log"
echo "   前端: tail -f $LOG_DIR/frontend.log"
echo ""
echo "🛑 停止服务："
echo "   bash stop.sh"
echo ""

