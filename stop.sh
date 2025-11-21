#!/bin/bash

# 生活效期管理系统 - 停止脚本

BASE_DIR=$(cd "$(dirname "$0")" && pwd)

echo "🛑 正在停止生活效期管理系统..."
echo ""

# 停止后端
if [ -f "$BASE_DIR/.backend.pid" ]; then
  BACKEND_PID=$(cat "$BASE_DIR/.backend.pid")
  if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "📦 停止后端服务 (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    rm -f "$BASE_DIR/.backend.pid"
    echo "   ✓ 后端已停止"
  else
    echo "   ℹ 后端进程不存在"
    rm -f "$BASE_DIR/.backend.pid"
  fi
else
  echo "   ℹ 未找到后端 PID 文件"
fi

# 停止前端
if [ -f "$BASE_DIR/.frontend.pid" ]; then
  FRONTEND_PID=$(cat "$BASE_DIR/.frontend.pid")
  if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    rm -f "$BASE_DIR/.frontend.pid"
    echo "   ✓ 前端已停止"
  else
    echo "   ℹ 前端进程不存在"
    rm -f "$BASE_DIR/.frontend.pid"
  fi
else
  echo "   ℹ 未找到前端 PID 文件"
fi

echo ""
echo "✅ 所有服务已停止"
echo ""

