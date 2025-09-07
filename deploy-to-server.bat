@echo off
REM HabitLearner Windows部署脚本
REM 用于自动部署到服务器并配置Nginx

echo 🚀 开始部署 HabitLearner 到服务器...

REM 配置变量（请根据您的服务器信息修改）
set SERVER_USER=your-username
set SERVER_HOST=your-server-ip
set SERVER_PATH=/var/www/habitlearner.cn

REM 1. 构建项目
echo 📦 构建项目...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 项目构建成功

REM 2. 上传文件到服务器
echo 📤 上传文件到服务器...
scp -r dist/* %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%/

if %errorlevel% neq 0 (
    echo ❌ 文件上传失败
    pause
    exit /b 1
)

echo ✅ 文件上传成功

REM 3. 上传Nginx配置
echo ⚙️ 配置Nginx...
scp nginx-spa-config.conf %SERVER_USER%@%SERVER_HOST%:/tmp/habitlearner-nginx.conf

REM 4. 在服务器上执行配置命令
echo 🔧 配置服务器...
ssh %SERVER_USER%@%SERVER_HOST% "sudo chown -R www-data:www-data %SERVER_PATH%/ && sudo chmod -R 755 %SERVER_PATH%/ && sudo cp /tmp/habitlearner-nginx.conf /etc/nginx/sites-available/habitlearner.cn && sudo ln -sf /etc/nginx/sites-available/habitlearner.cn /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl restart nginx && rm -f /tmp/habitlearner-nginx.conf"

if %errorlevel% equ 0 (
    echo 🎉 部署完成！
    echo 🌐 网站地址: https://habitlearner.cn
    echo 📋 请测试以下URL:
    echo    - https://habitlearner.cn/
    echo    - https://habitlearner.cn/auth
    echo    - https://habitlearner.cn/dashboard
) else (
    echo ❌ 部署过程中出现错误
)

pause
