#!/bin/bash

# 生活效期 - 停止脚本

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}==============================${NC}"
echo -e "${GREEN}    生活效期 - 停止脚本${NC}"
echo -e "${GREEN}==============================${NC}"
echo ""

# 停止后端
if [ -f "$SCRIPT_DIR/backend.pid" ]; then
    pid=$(cat "$SCRIPT_DIR/backend.pid")
    if kill -0 $pid 2>/dev/null; then
        kill $pid 2>/dev/null
        echo -e "${GREEN}✓ 后端服务已停止 (PID: $pid)${NC}"
    else
        echo -e "${RED}后端服务未运行${NC}"
    fi
    rm -f "$SCRIPT_DIR/backend.pid"
else
    # 尝试通过端口查找
    pid=$(lsof -ti :3101 2>/dev/null)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null
        echo -e "${GREEN}✓ 后端服务已停止 (PID: $pid)${NC}"
    else
        echo -e "${RED}后端服务未运行${NC}"
    fi
fi

# 停止前端
if [ -f "$SCRIPT_DIR/frontend.pid" ]; then
    pid=$(cat "$SCRIPT_DIR/frontend.pid")
    if kill -0 $pid 2>/dev/null; then
        kill $pid 2>/dev/null
        echo -e "${GREEN}✓ 前端服务已停止 (PID: $pid)${NC}"
    else
        echo -e "${RED}前端服务未运行${NC}"
    fi
    rm -f "$SCRIPT_DIR/frontend.pid"
else
    # 尝试通过端口查找
    pid=$(lsof -ti :3100 2>/dev/null)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null
        echo -e "${GREEN}✓ 前端服务已停止 (PID: $pid)${NC}"
    else
        echo -e "${RED}前端服务未运行${NC}"
    fi
fi

echo ""
echo -e "${GREEN}所有服务已停止${NC}"
