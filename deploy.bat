@echo off
echo 🚀 HabitLearner 部署脚本
echo ========================

echo 📦 构建生产版本...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo ✅ 构建成功！

echo 📁 检查构建文件...
if not exist "dist\index.html" (
    echo ❌ 找不到 index.html 文件！
    pause
    exit /b 1
)

echo ✅ 构建文件检查完成！

echo 📋 部署清单：
echo - 将 dist 目录内的所有文件上传到虚拟主机网站根目录
echo - 将 .htaccess 文件上传到网站根目录（Apache 服务器）
echo - 确保 Apache 启用了 mod_rewrite 模块
echo - 设置正确的文件权限

echo.
echo 🎯 下一步操作：
echo 1. 将 dist 目录内容上传到虚拟主机
echo 2. 上传 .htaccess 文件
echo 3. 测试网站访问

pause
