#!/bin/bash

# 生活效期 - 启动脚本
# 前端端口: 3100
# 后端端口: 3101

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_PORT=3100
BACKEND_PORT=3101

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==============================${NC}"
echo -e "${GREEN}    生活效期 - 启动脚本${NC}"
echo -e "${GREEN}==============================${NC}"
echo ""

# 检查端口是否被占用
check_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -ti :$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}警告: ${name}端口 $port 已被占用 (PID: $pid)${NC}"
        read -p "是否杀掉该进程并重启? (y/n): " choice
        case "$choice" in
            y|Y )
                echo -e "正在终止进程 $pid..."
                kill -9 $pid 2>/dev/null
                sleep 1
                echo -e "${GREEN}进程已终止${NC}"
                return 0
                ;;
            * )
                echo -e "${RED}跳过 ${name} 启动${NC}"
                return 1
                ;;
        esac
    fi
    return 0
}

# 启动后端
start_backend() {
    echo -e "\n${GREEN}[1/2] 启动后端服务...${NC}"
    
    if ! check_port $BACKEND_PORT "后端"; then
        return 1
    fi
    
    cd "$SCRIPT_DIR/backend"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "正在安装后端依赖..."
        npm install
    fi
    
    # 后台启动
    nohup node server.js > "$SCRIPT_DIR/backend.log" 2>&1 &
    local pid=$!
    echo $pid > "$SCRIPT_DIR/backend.pid"
    
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✓ 后端服务已启动 (PID: $pid, 端口: $BACKEND_PORT)${NC}"
        return 0
    else
        echo -e "${RED}✗ 后端服务启动失败，请检查 backend.log${NC}"
        return 1
    fi
}

# 启动前端
start_frontend() {
    echo -e "\n${GREEN}[2/2] 启动前端服务...${NC}"
    
    if ! check_port $FRONTEND_PORT "前端"; then
        return 1
    fi
    
    cd "$SCRIPT_DIR/frontend"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "正在安装前端依赖..."
        npm install
    fi
    
    # 后台启动
    nohup npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
    local pid=$!
    echo $pid > "$SCRIPT_DIR/frontend.pid"
    
    sleep 3
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✓ 前端服务已启动 (PID: $pid, 端口: $FRONTEND_PORT)${NC}"
        return 0
    else
        echo -e "${RED}✗ 前端服务启动失败，请检查 frontend.log${NC}"
        return 1
    fi
}

# 主流程
start_backend
backend_result=$?

start_frontend
frontend_result=$?

echo ""
echo -e "${GREEN}==============================${NC}"
if [ $backend_result -eq 0 ] && [ $frontend_result -eq 0 ]; then
    echo -e "${GREEN}    所有服务启动成功!${NC}"
    echo -e "${GREEN}==============================${NC}"
    echo ""
    echo -e "前端地址: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "后端地址: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
    echo ""
    echo -e "日志文件:"
    echo -e "  前端: $SCRIPT_DIR/frontend.log"
    echo -e "  后端: $SCRIPT_DIR/backend.log"
    echo ""
    echo -e "停止服务: ${YELLOW}./stop.sh${NC}"
else
    echo -e "${YELLOW}    部分服务启动失败${NC}"
    echo -e "${GREEN}==============================${NC}"
fi
