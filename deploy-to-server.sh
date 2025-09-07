#!/bin/bash

# HabitLearner 服务器部署脚本
# 用于自动部署到服务器并配置Nginx

echo "🚀 开始部署 HabitLearner 到服务器..."

# 配置变量（请根据您的服务器信息修改）
SERVER_USER="your-username"
SERVER_HOST="your-server-ip"
SERVER_PATH="/var/www/habitlearner.cn"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/habitlearner.cn"

# 1. 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 项目构建成功"

# 2. 上传文件到服务器
echo "📤 上传文件到服务器..."
rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败"
    exit 1
fi

echo "✅ 文件上传成功"

# 3. 上传Nginx配置
echo "⚙️ 配置Nginx..."
scp nginx-spa-config.conf ${SERVER_USER}@${SERVER_HOST}:/tmp/habitlearner-nginx.conf

# 4. 在服务器上执行配置命令
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    # 设置文件权限
    sudo chown -R www-data:www-data /var/www/habitlearner.cn/
    sudo chmod -R 755 /var/www/habitlearner.cn/
    
    # 配置Nginx
    sudo cp /tmp/habitlearner-nginx.conf /etc/nginx/sites-available/habitlearner.cn
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/habitlearner.cn /etc/nginx/sites-enabled/
    
    # 测试Nginx配置
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        # 重启Nginx
        sudo systemctl restart nginx
        echo "✅ Nginx配置成功并已重启"
    else
        echo "❌ Nginx配置测试失败"
        exit 1
    fi
    
    # 清理临时文件
    rm -f /tmp/habitlearner-nginx.conf
EOF

if [ $? -eq 0 ]; then
    echo "🎉 部署完成！"
    echo "🌐 网站地址: https://habitlearner.cn"
    echo "📋 请测试以下URL:"
    echo "   - https://habitlearner.cn/"
    echo "   - https://habitlearner.cn/auth"
    echo "   - https://habitlearner.cn/dashboard"
else
    echo "❌ 部署过程中出现错误"
    exit 1
fi
